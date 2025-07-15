from uuid import uuid4
from collections import defaultdict
from datetime import timedelta, datetime, time

from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from .base_handler import BaseHandler
from app.service import circuit_stages as circuit_stages_service
from app.service import optionals as optionals_services 
from app.service import activity as activity_services
from app.service import hotel_reservation as hotel_reservation_services
from app.service import group_city_permits as permits_service

from app.models.days import Days
from app.models.activity import Activity
from app.models.hotel_reservation import HotelReservation

from app.schemas.day_transports import DayTransportCreate
from app.schemas.group_city_permits import GroupCityPermitCreate, PermitStatus

from app.crud import days as days_functions
from app.crud.day_transports import create_transport as day_transport_create
from app.crud import group as group_functions 
from app.crud.cities import get_city



class DaysHandler(BaseHandler):
    async def create(self, db: AsyncSession, id_group:str, arrival_date: datetime, departure_date: datetime, id_circuit:str):

        difference = departure_date - arrival_date
        # Obtener la diferencia en días
        days_difference = difference.days   
        print(f"La diferencia es de {days_difference} días.")

        # Consultar las ciudades del circuito  (circuit_stage)
        circuit_stages = await circuit_stages_service.list_stages(db=db, circuit_id=id_circuit)

        current_date = arrival_date  # Fecha que usaremos para iterar
        stage_index = 0  # Índice para recorrer circuit_stages
        total_stages = len(circuit_stages)

        # mapa ciudad_id -> [fecha_mín, fecha_máx]
        permit_windows: dict[int, list[datetime]] = defaultdict(list)

        # necesitamos el bus asignado al grupo
        group_row = await group_functions.get_group(db, id_group)
        bus_id = group_row.id_transport
        city_permit_cache: dict[int, bool] = {} 

        print(f'Total stages: {total_stages}')

        
        # Crear el registro de días
        # deberia consultar la tabla circuit_stage para cada id_circuito y crear el registro por dia en la tabla days
        for day in range(days_difference + 1):  # Iterar sobre todos los días hasta la fecha de salida
            id_days = str(uuid4())
            print(f'stage_index: {stage_index}, total_stages: {total_stages}')
            if stage_index < total_stages:
                # Obtenemos la etapa del circuito correspondiente al índice actual
                stage = circuit_stages[stage_index] 

            else:
                # Extender la estadía en la última ciudad si superamos el número de etapas del circuito
                stage = circuit_stages[-1] 
            
            print(stage)
            city = stage.city_name
            city_id = stage.city_id
            ferry = any(t.mode == "ferry" for t in stage.transports)

            # Crear el registro para el día en la tabla `days`
            day_entry = Days(
                id = id_days,
                id_group=id_group,
                day=day + 1,  # El día dentro del itinerario, comenzando desde 1
                date=current_date,
                city=city,
                ferry=ferry
            )

            result = await days_functions.create(db=db, days_data=day_entry)


            for st_t in stage.transports:          # lista plantilla
                print(st_t)
                await day_transport_create(
                    db=db,
                    id_day=day_entry.id,
                    payload=DayTransportCreate(
                        mode=st_t.mode,
                        notes=st_t.notes,
                        updated_by="system",       # o quien corresponda
                        departure_time = datetime.combine(current_date, st_t.depart_time) if st_t.depart_time else datetime.combine(current_date, time(11, 0))),
                )
            
            # -------- registrar ciudad que exige permiso --------------------------
            if city_id not in city_permit_cache:
                city_row = await get_city(db, city_id)      # UNA query por ciudad
                print(f"City row: {city_row}")
                city_permit_cache[city_id] = city_row.needs_bus_permit

            if city_permit_cache[city_id]:
                permit_windows[city_id].append(current_date)


            print(f"stage: {stage}")
            if stage:
                # como tiene stage buscamos el opcional correspondiente y se lo asignamos 
                result = await optionals_services.get_optionals(db=db, id_stage=stage.id_stage)

                for r in result:
                  print(f'el opcional es: {r.id_optional}, para el dia: {day}, el r es {r} y result: \n{result}')
                  activity_data = Activity(
                      id = str(uuid4()),
                      id_days= id_days, 
                      date = current_date,
                      time = r.activity_time, 
                      id_optional = r.id_optional,
                      status_optional = 'pending',                      
                    )
                  request = await activity_services.create(db=db, activity_data=activity_data, source='auto')  
            
            if departure_date > current_date:
                print(f'Departure date:{departure_date}, current_date:{current_date}')
                # Aca deberiamos guardar el hotel
                hotel_info = HotelReservation(
                    id = str(uuid4()),
                    id_group = id_group,
                    created_at = current_date, 
                    id_day = id_days,
                    PAX = 0,
                    )

                result = await hotel_reservation_services.create_base(db=db, hotel_data=hotel_info)

            # Avanzar la fecha al día siguiente
            current_date += timedelta(days=1)

            # Solo incrementamos el índice de la etapa si aún no hemos llegado al final del circuito base
            if stage_index < total_stages - 1:
                stage_index += 1
        
        # ------------------------------------------------------------------ #
        # Crear un permiso “pending” por ciudad (si aplica)
        # ------------------------------------------------------------------ #
        for city_id, dates in permit_windows.items():
            valid_from = min(dates).date()
            valid_to = max(dates).date()

            payload = GroupCityPermitCreate(
                id_permit=str(uuid4()),
                id_group=id_group,
                id_city=city_id,
                id_transport=bus_id,
                valid_from=valid_from,
                valid_to=valid_to,
                status=PermitStatus.pending,
                updated_by="system",
            )
            try:
                await permits_service.create_permit(db, payload)
            except HTTPException as exc:
                # Si el permiso ya existe (re-ejecución), ignoramos el conflicto
                raise

        # Guardar todos los cambios en la base de datos
        return
       

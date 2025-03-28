from .base_handler import BaseHandler
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import timedelta, datetime
from app.service import circuit_stages as circuit_stages_service
from app.models.days import Days
from app.crud import days as days_functions
from app.service import optionals as optionals_services 
from app.models.activity import Activity
from app.service import activity as activity_services
from app.models.hotel_reservation import HotelReservation
from app.service import hotel_reservation as hotel_reservation_services
from uuid import uuid4


class DaysHandler(BaseHandler):
    async def create(self, db: AsyncSession, id_group:str, arrival_date: datetime, departure_date: datetime, id_circuit:str):

        difference = departure_date - arrival_date
        # Obtener la diferencia en días
        days_difference = difference.days   
        print(f"La diferencia es de {days_difference} días.")

        # Consultar las ciudades del circuito  (circuit_stage)
        circuit_stages = await circuit_stages_service.get_circuit_stage(db=db, id_circuit=id_circuit)

        current_date = arrival_date  # Fecha que usaremos para iterar
        stage_index = 0  # Índice para recorrer circuit_stages
        total_stages = len(circuit_stages)

        print(f'Total stages: {total_stages}')

        
        # Crear el registro de días
        # deberia consultar la tabla circuit_stage para cada id_circuito y crear el registro por dia en la tabla days
        for day in range(days_difference + 1):  # Iterar sobre todos los días hasta la fecha de salida
            id_days = str(uuid4())
            print(f'stage_index: {stage_index}, total_stages: {total_stages}')
            if stage_index < total_stages:
                # Obtenemos la etapa del circuito correspondiente al índice actual
                stage = circuit_stages[stage_index]
                city = stage.city_name
                ferry = bool(stage.ferry)  # Convertir a booleano

                

            else:
                # Extender la estadía en la última ciudad si superamos el número de etapas del circuito
                city = circuit_stages[-1].city_name
                ferry = False  # Asumimos que no hay ferry en los días extendidos

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
                    )
                  request = await activity_services.create(db=db, activity_data=activity_data)  
            
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

        # Guardar todos los cambios en la base de datos
        return
       

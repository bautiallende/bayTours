from .base_handler import BaseHandler
from fastapi import HTTPException
from uuid import uuid4
import json
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.clients_room import ClientsRoom
from app.schemas.clients_room import HotelRoomUpdate
from app.service import days as days_service
from datetime import timedelta
from datetime import datetime, time
from app.service import rooms_composition as rooms_composition_service
from app.models.rooms_composition import RoomsComposition
from app.crud import clients_room as client_rooms_functions
from app.crud import group as group_functions
from app.crud import hotel_reservation as hotel_reservation_functions
from app.crud import client_group as client_group_functions
from app.crud import clients_room as client_rooms_functions
from app.crud import hotel as hotel_functions
from app.crud import room_composition as rooms_composition_functions
from app.crud import clients as clients_functions

class ClientRoomHandler(BaseHandler):

    async def create(self, db:AsyncSession, client_id:str, group_id:str, room_ids_by_day:dict, new:bool = False):
        
        ## aca debemos buscar en itinerari y crear un cuarto por cada dia del id_stage y el date
        days_data = await days_service.get_all(db=db, id_group=group_id)
        
        # Ordenar el itinerario por day_number para iterar en orden cronológico
        days_data.sort(key=lambda x: x.day)

        # Inicializar variables para el procesamiento
        current_city_id = None
        old_city_id = None
        old_city = None
        entry_date = None
        departure_date = None
        day_id = None
        itinerary = 0
        itinerary_long = len(days_data)
        last_pernocta_index = len(days_data) - 1

        # Recorrer el itinerario para crear los registros de las habitaciones
        for day in days_data:
            print(f"Procesando día: {day.day} - ID: {day.id} - Ciudad: {day.id_city}")
            if day.day == 9:
                print(f"Dia 9: {day.id} - {day.date}")
            if day.day == 10:
                print(f"Dia 10: {day.id} - {day.date}")
            old_city = current_city_id
            if current_city_id is None:
                entry_date = datetime.combine(day.date, datetime.strptime("15:00:00", "%H:%M:%S").time())  # Check-in a las 15:00
            
            

            if current_city_id is not None and day.id_city != current_city_id:

                if new and departure_date:
                    room_composition = RoomsComposition(
                        id = room_comp_id,
                        id_room = None,
                        room_number = None,
                        check_in_date = entry_date,
                        departure_date = departure_date,
                        price = None,
                        currency = None,
                        room_type = None,
                        complement = None,
                        complement_currency = None,
                        status = "new",
                        comments = json.dumps([]),
                        )

                    await rooms_composition_service.create(db=db, room_data=room_composition)
                
                # Crear el registro de la habitación
                room_entry = ClientsRoom(
                    id= str(uuid4()),
                    id_days= day_id,
                    room_composition_id= room_comp_id,
                    status= 'New',
                    comments= None,
                    client_id = client_id
                )
                db.add(room_entry)


                current_city_id = day.id_city
                entry_date = datetime.combine(day.date, datetime.strptime("15:00:00", "%H:%M:%S").time())
                departure_date = datetime.combine(day.date + timedelta(days=1), datetime.strptime("11:00:00", "%H:%M:%S").time())
                room_comp_id = room_ids_by_day.get(day.id) if room_ids_by_day else None
                day_id = day.id
                
            
            elif day.id_city == current_city_id or not current_city_id:
                
                departure_date = datetime.combine(day.date + timedelta(days=1), datetime.strptime("11:00:00", "%H:%M:%S").time())
                
                current_city_id = day.id_city
                room_comp_id = room_ids_by_day.get(day.id) if room_ids_by_day else None
                day_id = day.id
                
            
            itinerary += 1
            at_final_segment = itinerary == itinerary_long - 1
            is_departure_day = itinerary - 1 == last_pernocta_index + 1
            print(f"itinerary: {itinerary}, at_final_segment: {at_final_segment}, is_departure_day: {is_departure_day}")
            if at_final_segment and not is_departure_day and old_city_id != current_city_id:
                if new:
                    room_composition = RoomsComposition(
                        id = room_comp_id,
                        id_room = None,
                        room_number = None,
                        check_in_date = entry_date,
                        departure_date = departure_date,
                        price = None,
                        currency = None,
                        room_type = None,
                        complement = None,
                        complement_currency = None,
                        status = "new",
                        comments = json.dumps([]),
                        )

                    await rooms_composition_service.create(db=db, room_data=room_composition)


                # Crear el registro de la habitación
                room_entry = ClientsRoom(
                    id= str(uuid4()),
                    id_days= day_id,
                    room_composition_id= room_comp_id,
                    status= 'New',
                    comments= None,
                    client_id = client_id
                )
                db.add(room_entry)

        # Guardar todos los cambios en la base de datos
        db.commit()


    async def create_one(self, db:AsyncSession, room_dats:dict, client_id:str):
        
        room_comp_id = str(uuid4())
        
        room_composition = RoomsComposition(
            id = room_comp_id,
            id_room = None,
            room_number = None,
            check_in_date = room_dats.get('check_in_date'),
            departure_date = room_dats.get('departure_date'),
            price = None,
            currency = None,
            room_type = None,
            complement = None,
            complement_currency = None,
            status = "new",
            comments = json.dumps([]),
            )
        
        response = await rooms_composition_service.create(db=db, room_data=room_composition)
    
        # hay que buscar el correspondiente para el cliente con los ids de days y de client_id
        clients_room = await client_rooms_functions.get_client_by_client_id_and_id_days(client_id=client_id, id_days=room_dats.get('id_days'), db=db)
        
        # Si existe, actualizarlo
        clients_room.room_composition_id = room_comp_id
        db.commit()
        db.refresh(clients_room)
        return clients_room
        

    async def update_room(self, db:AsyncSession, client_room_data:HotelRoomUpdate):

        if client_room_data.separatedClients:
            new_room = {
                'check_in_date': client_room_data.check_in_date,
                'departure_date': client_room_data.departure_date,
                'id_days': client_room_data.id_days,
                }
            for s in client_room_data.separatedClients:
                request = await self.create_one(db=db, room_dats=new_room, client_id=s)

        if client_room_data.newClients:
            for n in client_room_data.newClients:
                await self.update_one(db=db, id_days=client_room_data.id_days, client_id=n, room_composition_id=client_room_data.room_composition_id)

        # Actualizar el registro de la habitación
        room_data = await super().update(db, client_room_data)
        return room_data


    async def update_one(self, db:AsyncSession, id_days:str, client_id:str, room_composition_id:str):
        client_data = await client_rooms_functions.get_client_by_client_id_and_id_days(client_id=client_id, id_days=id_days, db=db)
        if client_data:
            client_data.room_composition_id = room_composition_id
            db.commit()
            db.refresh(client_data)
            return client_data
        else:
            return None
        

    async def update_all_rooms(self, db:AsyncSession, id_group:str, id_days:str):


        # 1. Obtener información base
        group_data = await group_functions.get_group(db=db, id_group=id_group)
        if not group_data:
            return "Grupo no encontrado"
        
        id_list_day = id_days.split(',')
        count_d = 0
        total_days = len(id_list_day)
        for d in id_list_day:
            count_d += 1
            hotel_data = await hotel_reservation_functions.get_reserved_by_group_day(db=db, id_group=id_group, id_day=d)
            
            room_composition_data = await rooms_composition_functions.get_room_composition_by_id_days(db=db, id_days=d)

            if not room_composition_data:
                return "No se encontraron datos de habitaciones para el día especificado. Si hay mas de 1 hotel asignado, favor de asignar las habitaciones manualmente."
            
            print(f"Datos de habitaciones: {room_composition_data}")
            rooms_config = {'total_hotel': 0}
            for r in room_composition_data:
                if r[2] == None  and rooms_config.get('sin_hotel') is not None:
                    rooms_config['sin_hotel']['client_id'].append(r[5])
                
                elif r[2] not in rooms_config:
                    rooms_config[r[2] if r[2] != None else 'sin_hotel'] = {
                        'client_id': [r[5]],
                    }
                    rooms_config['total_hotel'] += 1
                else:
                    rooms_config[r[2]]['client_id'].append(r[5])
                    
            print(f"Configuraciones de habitaciones: {rooms_config}")
            print(f"Datos de hotel: {hotel_data}")

            

            if len(hotel_data) > rooms_config['total_hotel'] and rooms_config['total_hotel'] != 0 :
                return "Más de un hotel asignada para el mismo día"
            
            for h in hotel_data:
                print(f"Datos de hotel: {h}")
                print(f"Datos de hotel: {h.__dict__ }")
                if  h.id_hotel == None and count_d == total_days:
                    return "Hotel no encontrado"
                elif not h:
                    continue
                elif h.id_hotel == None:
                    continue

                print(h)
                print(f"largo de sin_hotel: {len(rooms_config.get('sin_hotel', {}).get('client_id', []))}")
                print(f"pax hotel {h.PAX}")
                if len(rooms_config.get(h.id_hotel, [])) == h.PAX:
                    continue 
                elif len(rooms_config.get('sin_hotel', {}).get('client_id', [])) == h.PAX or rooms_config['total_hotel'] == 0:
                    

                    # 2. Obtener las configuraciones disponibles del hotel
                    rooms_hotel_type = await hotel_functions.get_hotel_room(db=db, id_hotel=h.id_hotel)
                    # Ejemplo de rooms_hotel_type: [{'id_room': 11, 'type': "DBL", 'price': 20, 'currency': "EUR", 'pax': 2}, ...]

                    # 3. Obtener en bloque las entradas de client_group para el grupo

                    client_groups = await client_group_functions.get_client_group(db=db, id_group=id_group)
                    if not client_groups:
                        return "No se encontraron datos en client_group para el grupo"
                    # Construir un diccionario: client_id -> room_type (se asume que ya vienen normalizados, por ejemplo "DBL", "SGL", etc.)
                    print(f"Datos de client_group: {client_groups}")
                    client_room_type_map = {cg.id_clients: cg.room_type.upper() for cg in client_groups}

                    # 3b. Obtener la información de todos los clientes del grupo, para evaluar la edad
                    group_clients = await clients_functions.get_clients_by_group_id(db=db, id_group=id_group)
                    # Generar un diccionario: client_id -> birth_date
                    client_birth_map = {}
                    for client in group_clients:
                        # Asumimos que en cada registro está presente el id_clients y birth_date
                        client_birth_map[client.get("id_clients")] = client.get('birth_date')

                    # 4. Obtener los registros de clients_room para el día indicado
                    clients_room = await client_rooms_functions.get_by_id_days(db=db, id_days=d)
                    if not clients_room:
                        if total_days > count_d:
                            continue
                        else:
                            return "No se encontraron registros de clientes para el día"

                    # Agrupar los registros por room_composition_id
                    grouped = {}
                    for cr in clients_room:
                        key = cr.room_composition_id
                        if key not in grouped:
                            grouped[key] = []
                        grouped[key].append(cr)
                    print(f"Grupos de clientes por room_composition_id: {grouped}")

                    updated_rooms = []


                    # Establecer las horas fijas para check-in y check-out
                    # Se toma la fecha de hotel_data[0].start_date y hotel_data[0].end_date y se asignan las horas
                    check_in_datetime = datetime.combine(h.start_date, h.hour_check_in)
                    check_out_datetime = datetime.combine(h.end_date, h.hour_check_out)

                    # 5. Iterar sobre cada grupo
                    for room_comp_id, client_list in grouped.items():
                        num_clients = len(client_list)
                        # Recolectar los tipos solicitados para todos los clientes de esta agrupación
                        requested_types = set()
                        for cr in client_list:
                            room_req = client_room_type_map.get(cr.client_id)
                            if room_req:
                                requested_types.add(room_req)
                        print(f"client_list: {client_list}")
                        if len(requested_types) != 1:
                            print(f"Inconsistencia en room_composition_id {room_comp_id}: Se encontraron múltiples room_type: {requested_types}")
                            continue
                        requested_room_type = requested_types.pop()
                        print(f"Para room_composition_id {room_comp_id} se solicitó {requested_room_type} con {num_clients} clientes.")

                        matching_configs = [config for config in rooms_hotel_type if config.type.upper() == requested_room_type]
                        if not matching_configs:
                            print(f"No existe configuración para el tipo {requested_room_type} en el hotel.")
                            continue

                        # Para cada configuración válida, se asume que 'pax' es la capacidad normal
                        matched_config = None
                        for config in matching_configs:
                            capacity = config.pax  # Capacidad estándar
                            if num_clients == capacity:
                                matched_config = config
                                break
                            elif num_clients == capacity + 1:
                                # Verificar si al menos uno de los clientes es menor de 12 años respecto al check‑in
                                minor_found = False
                                for cr in client_list:
                                    birth_date = client_birth_map.get(cr.client_id)
                                    if not birth_date:
                                        continue
                                    age = check_in_datetime.year - birth_date.year - (
                                        (check_in_datetime.month, check_in_datetime.day) < (birth_date.month, birth_date.day)
                                    )
                                    if age < 12:
                                        minor_found = True
                                        break
                                if minor_found:
                                    matched_config = config
                                    break
                        if not matched_config:
                            print(f"No hay disponibilidad para {requested_room_type} con {num_clients} clientes en {room_comp_id}.")
                            continue

                        # 7. Actualizar el registro en rooms_composition
                        room_composition  = await rooms_composition_functions.get_room_composition_by_id(db=db, room_composition_id=room_comp_id)

                        updated_room_composition = HotelRoomUpdate(
                            id = room_composition.id,
                            id_room = matched_config.id_room,
                            id_days = d,
                            id_hotel_reservation = h.id,
                            room_composition_id = room_composition.id,
                            room_number='',
                            check_in_date=check_in_datetime,
                            departure_date=check_out_datetime,
                            price=matched_config.price,
                            currency=matched_config.currency,
                            room_type=requested_room_type,
                            complement=None,
                            complement_currency=None,
                            status="Provisional",
                            comments=json.dumps(f"Asignación automatica {num_clients} clientes, {requested_room_type}"),
                        )

                        updated = await super().update(db=db, client_room_data=updated_room_composition)

                        # room_composition.id_room = matched_config.id_room
                        # room_composition.room_type = requested_room_type
                        # room_composition.price = matched_config.price
                        # room_composition.currency = matched_config.currency
                        # room_composition.check_in_date = check_in_datetime
                        # room_composition.departure_date = check_out_datetime
                        # room_composition.status = "Provisional"
                        # room_composition.comments = json.dumps(f"Asignación automática {num_clients} clientes, {requested_room_type}")
                        
                        # updated = await rooms_composition_functions.update(db=db, room_data=room_composition)
            
        return True
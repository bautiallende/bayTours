from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime, timedelta
import json
from uuid import uuid4
from app.service import rooms_composition as rooms_composition_service
from app.crud import clients_room as client_rooms_functions
from app.models.rooms_composition import RoomsComposition
from app.schemas.clients_room import HotelRoomUpdate
from app.models.clients_room import ClientsRoom
from app.crud import clients_room as clients_room_functions
from app.crud import hotel_reservation as hotel_reservation_functions
from fastapi import HTTPException
from app.crud import room_composition as room_composition_functions
from app.crud import days as days_functions

class BaseHandler():

    def __init__(self):
        pass
    

    async def create_base(self, db:AsyncSession, room_dats:dict):
        
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
    
        return response
    

    async def update(self, db: AsyncSession, client_room_data:HotelRoomUpdate):
        update = False
        room_data = await room_composition_functions.get_room_composition_by_id(db, client_room_data.room_composition_id)

        print("\nroom_data", room_data.__dict__)
        print("\nclient_room_data", client_room_data.__dict__)
        print(f'\ndate dif {room_data.departure_date.date() - room_data.check_in_date.date()}\n')
        print(f'\ndate diff new data {client_room_data.departure_date.date() - client_room_data.check_in_date.date()}\n')
        if not room_data:
            return {"message": "No se encontro la habitacion"}
        
        
        clients_room = await clients_room_functions.get_by_room_composition_id(db=db, room_composition_id=client_room_data.room_composition_id)
        for client in clients_room:
            print("clients_room", client.__dict__ ) 
        clients_in_room = {"client_id": client.client_id for client in clients_room }
        print("clients_in_room", clients_in_room)


        if (room_data.departure_date.date() - room_data.check_in_date.date()) != (client_room_data.departure_date.date() - client_room_data.check_in_date.date()):
            # aca debemos crear la distribucion nueva, dejar que se guarde el cuarto para ese dia pero crear la estuctura nueva del dia faltante
            actual_days = await days_functions.get_day_by_id_days(db=db, id_days=client_room_data.id_days)
            if actual_days:
                all_days = await days_functions.get_day_by_group_and_city(db=db, id_group=actual_days.id_group, city=actual_days.city)
                if all_days:
                    for day in all_days:
                        print("\nday", day.__dict__)
                        # el problema esta aca, al enviar el id_days del segundo dia

                        if day.id != client_room_data.id_days or day.date != client_room_data.check_in_date.date():
                            other_day_room  = await client_rooms_functions.get_by_id_days(db=db, id_days=day.id, client_ids=[client.client_id for client in clients_room])
                            if not other_day_room:
                                room_dats = {
                                    'check_in_date': datetime.combine(day.date, datetime.strptime("15:00:00", "%H:%M:%S").time()),
                                    'departure_date': datetime.combine(day.date + timedelta(days=1), datetime.strptime("11:00:00", "%H:%M:%S").time()),
                                }
                                new_composition = await self.create_base(db=db, room_dats=room_dats)

                                for client in clients_room:
                                    room_entry = ClientsRoom(
                                        id= str(uuid4()),
                                        id_days= day.id,
                                        room_composition_id= new_composition.id,
                                        status= 'New',
                                        comments= None,
                                        client_id = client.client_id 
                                    )
                                    db.add(room_entry)
                                    db.commit()
                                
                                if day.date == client_room_data.check_in_date.date():
                                    new_composition.id_room = client_room_data.id_room
                                    new_composition.room_number = client_room_data.room_number
                                    new_composition.check_in_date = client_room_data.check_in_date
                                    new_composition.departure_date = client_room_data.departure_date
                                    new_composition.price = client_room_data.price
                                    new_composition.currency = client_room_data.currency
                                    new_composition.complement = client_room_data.complement
                                    new_composition.complement_currency = client_room_data.complement_currency
                                    new_composition.status = client_room_data.status
                                    existing_comments = json.loads(room_data.comments) if room_data.comments else []
                                    if client_room_data.comments and client_room_data.comments.strip():  # Verificar si hay un nuevo comentario y no está vacío o solo contiene espacios
                                        new_comment = f'({datetime.now().strftime("%d/%m/%y %H:%M")}) - {client_room_data.comments}'
                                        existing_comments.insert(0, new_comment)
                                        new_composition.comments = json.dumps(existing_comments)

                                    result = await room_composition_functions.update(db=db, room_data=new_composition)
                                    
                            elif day.date != client_room_data.check_in_date.date():
                                room_data.check_in_date = datetime.combine(day.date, datetime.strptime("15:00:00", "%H:%M:%S").time())
                                room_data.departure_date = datetime.combine(day.date + timedelta(days=1), datetime.strptime("11:00:00", "%H:%M:%S").time())
                                result = await room_composition_functions.update(db=db, room_data=room_data)

                                update = True

        if not update:
            print("client_room_data.id_days", client_room_data.id_days)
            hotel_info = await hotel_reservation_functions.get_by_id_day(db=db, id_day=client_room_data.id_days)
            
            rooms_date = await clients_room_functions.get_room_by_id_group_and_city(db=db, id_days=[client_room_data.id_days])
            
            
            room_capacity = len(clients_room)

            print("hotel_info", hotel_info)
            total_pax = hotel_info[0].PAX
            partial_pax = 0
            for p in rooms_date:
                print("p", p)
                if p.get('id_hotel', None) == hotel_info[0].id_hotel and p.get('id_clients', None) != clients_in_room.get('client_id', None):
                    partial_pax += 1

            if (total_pax <= partial_pax) or (int(total_pax) < (int(partial_pax) + int(room_capacity))):
                return {"message": "No hay suficientes habitaciones en el Hotel para este grupo"}
            


            room_data.id_room = client_room_data.id_room
            room_data.room_number = client_room_data.room_number
            room_data.check_in_date = client_room_data.check_in_date
            room_data.departure_date = client_room_data.departure_date
            room_data.price = client_room_data.price
            room_data.currency = client_room_data.currency
            room_data.complement = client_room_data.complement
            room_data.complement_currency = client_room_data.complement_currency
            room_data.status = client_room_data.status

            existing_comments = json.loads(room_data.comments) if room_data.comments else []
            if client_room_data.comments and client_room_data.comments.strip():  # Verificar si hay un nuevo comentario y no está vacío o solo contiene espacios
                new_comment = f'({datetime.now().strftime("%d/%m/%y %H:%M")}) - {client_room_data.comments}'
                existing_comments.insert(0, new_comment)
                room_data.comments = json.dumps(existing_comments)

            result = await room_composition_functions.update(db=db, room_data=room_data)
            return result
        

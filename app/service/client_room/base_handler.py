from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime
import json
from app.schemas.clients_room import HotelRoomUpdate
from app.crud import clients_room as clients_room_functions
from app.crud import hotel_reservation as hotel_reservation_functions
from fastapi import HTTPException

class BaseHandler():

    def __init__(self):
        pass

    async def update(self, db: AsyncSession, client_room_data:HotelRoomUpdate):

        room_data = await clients_room_functions.get_room_by_client_and_id(db, client_room_data.client_id, client_room_data.id)

        if not room_data:
            return {"message": "No se encontro la habitacion"}

        hotel_info = await hotel_reservation_functions.get_by_id_day(db=db, id_day=room_data.id_days)
        
        rooms_date = await clients_room_functions.get_room_by_id_group_and_city(db=db, id_days=[room_data.id_days])

        total_pax = hotel_info[0].PAX
        partial_pax = 0
        for p in rooms_date:
            if p.get('id_hotel', None) == hotel_info[0].id_hotel and p.get('id_clients', None) != client_room_data.client_id:
                partial_pax += 1

        if total_pax <= partial_pax:
            return {"message": "No hay suficientes habitaciones en el Hotel para este grupo"}
        
        room_data.id_hotel_reservation = client_room_data.id_hotel_reservation
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

        result = await clients_room_functions.update_room(db=db, client_room_data=room_data)
        return result
        

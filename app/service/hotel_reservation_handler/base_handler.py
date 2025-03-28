from sqlalchemy.ext.asyncio import AsyncSession
from datetime import time, datetime, date, timedelta
from uuid import uuid4
import json

from app.schemas.hotel_reservation import CreateBaseHotel, HotelReservationUpdate
from app.models.hotel_reservation import HotelReservation
from app.crud import hotel_reservation as hotel_reservation_funcions
from app.service import days as days_service
from app.service import hotels as hotel_service

class HotelsReservationsHandlers():

    async def create_base(self, db:AsyncSession, new_hotel: CreateBaseHotel):

        hotel = HotelReservation(**{
            'id':new_hotel.id,
            'id_group': new_hotel.id_group,
            'id_day': new_hotel.id_day,
            'created_at': new_hotel.created_at
            
        })

        result = await hotel_reservation_funcions.create(db=db, hotel_data=hotel)

        return result
    
            
    
    async def update(self, db:AsyncSession, hotel_info:HotelReservationUpdate):

        hotel_data = await hotel_reservation_funcions.get_by_id(db=db, id=hotel_info.id)

        hotel_data.id = hotel_info.id
        hotel_data.id_hotel = hotel_info.id_hotel
        hotel_data.id_group = hotel_info.id_group
        hotel_data.start_date = hotel_info.start_date
        hotel_data.end_date = hotel_info.end_date
        hotel_data.PAX = hotel_info.pax
        hotel_data.currency = hotel_info.currency
        hotel_data.total_to_pay = hotel_info.total_to_pay

        print(f'Comment: {hotel_info.comment}')
    
        # Manejar la lista de comentarios
        existing_comments = json.loads(hotel_data.comment) if hotel_data.comment else []
        if hotel_info.comment and hotel_info.comment.strip():  # Verificar si hay un nuevo comentario y no está vacío o solo contiene espacios
            new_comment = f'({datetime.now().strftime("%d/%m/%y %H:%M")}) - {hotel_info.comment}'
            existing_comments.insert(0, new_comment)
            hotel_data.comment = json.dumps(existing_comments)

        hotel_data.rooming_list = hotel_info.rooming_list
        hotel_data.pro_forma = hotel_info.pro_forma
        hotel_data.payment_date = hotel_info.payment_date
        hotel_data.payment_done_date =  hotel_info.payment_done_date
        hotel_data.payed_by = hotel_info.payed_by
        hotel_data.factura = hotel_info.factura
        hotel_data.iga = hotel_info.iga
        
        hotel = await hotel_reservation_funcions.update(db=db, hotel_data=hotel_data)
        return hotel



    def __init__(self):
        pass
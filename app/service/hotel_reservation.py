from sqlalchemy.ext.asyncio import AsyncSession
from .hotel_reservation_handler import reservation_handler
from app.models.hotel_reservation import HotelReservation
from app.crud import hotel_reservation as hotel_reservation_functions
from datetime import date

async def create(db:AsyncSession, hotel_data:HotelReservation):
    handler = reservation_handler.get('create')
    if handler:
        result = await handler(db=db, hotel_data=hotel_data)
        return result
    else:
        return None



async def asign_many(db:AsyncSession, id_group:str, client_id:list, id_hotel:str, id_days:list):
    handler =  reservation_handler.get('update_many')

    if handler:
        result = await handler(db=db, id_group=id_group, client_id=client_id, id_hotel=id_hotel, id_days=id_days)
        return result
    else:
        return None



async def get_by_group_and_date(db:AsyncSession, id_group:str, start_date:date, end_date:date):
    result = await hotel_reservation_functions.get_by_group_and_date(db=db, id_group=id_group, start_date=start_date, end_date=end_date)
    return result
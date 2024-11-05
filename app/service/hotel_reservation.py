from sqlalchemy.ext.asyncio import AsyncSession
from .hotel_reservation_handler import reservation_handler
from app.models.hotel_reservation import HotelReservation


async def create(db:AsyncSession, hotel_data:HotelReservation):
    handler = reservation_handler.get('create')
    result = await handler(db=db, hotel_data=hotel_data)
    return result
from sqlalchemy.ext.asyncio  import AsyncSession
from .base_handler import BaseHandler
from app.models.hotel_reservation import HotelReservation
from app.crud import hotel_reservation as hotel_reservation_funcions


class HotelReservationHandler(BaseHandler):
    async def create(self, db:AsyncSession, hotel_data:HotelReservation):
        result = await hotel_reservation_funcions.create(db=db, hotel_data=hotel_data)
        return result
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.hotel_reservation import HotelReservation


async def create(db:AsyncSession, hotel_data: HotelReservation):
    db.add(hotel_data)
    db.commit()
    return hotel_data
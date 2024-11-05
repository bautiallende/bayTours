from sqlalchemy.ext.asyncio import AsyncSession
from app.schemas.hotels import HotelBase
from .hotel_handler import hotels_actions









async def create(db: AsyncSession, hotel_data: HotelBase ):
    handler = hotels_actions.get('new_hotel')

    response = await handler(db, hotel_data)

    return response
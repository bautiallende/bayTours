from sqlalchemy.ext.asyncio import AsyncSession
from app.schemas.hotels import HotelBase
from .hotel_handler import hotels_actions
from app.crud import hotel as hotel_functions

async def create(db: AsyncSession, hotel_data: HotelBase ):
    handler = hotels_actions.get('new_hotel')

    response = await handler(db, hotel_data)

    return response


async def get_one(db:AsyncSession, id_hotel:int):
    result = await hotel_functions.get_one(db=db, id_hotel=id_hotel)
    return result

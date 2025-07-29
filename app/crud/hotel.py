from sqlalchemy.ext.asyncio import AsyncSession
from app.models.hotel import Hotel
from app.models.hotels_room import HotelsRooms
from sqlalchemy.future import select


async def get_one(db:AsyncSession, id_hotel):
    query = db.execute(select(Hotel).where(Hotel.id_hotel == id_hotel))
    return query.scalars().all()


async def get_by_city(db:AsyncSession, city:str):
    query = db.execute(select(Hotel).where(Hotel.id_city == city))
    return query.scalars().all()


async def get_hotel_room(db:AsyncSession, id_hotel:int):
    query = db.execute(select(HotelsRooms).where(HotelsRooms.id_hotel == id_hotel))
    return query.scalars().all()


async def get_unique_hotel_room_types(db: AsyncSession):
    query = (
        select(HotelsRooms.type)
        .group_by(HotelsRooms.type)
    )
    result = db.execute(query)
    # Devuelve una lista de valores únicos
    return result.scalars().all()

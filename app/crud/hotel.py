from sqlalchemy.ext.asyncio import AsyncSession
from app.models.hotel import Hotel
from sqlalchemy.future import select


async def get_one(db:AsyncSession, id_hotel):
    query = db.execute(select(Hotel).where(Hotel.id_hotel == id_hotel))
    return query.scalars().all()



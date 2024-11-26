from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.responsables_hotels import ResponsablesHotels



async def get_all(db:AsyncSession):
    result = db.execute(select(ResponsablesHotels).where(ResponsablesHotels.active == True))
    responsables_hotels = result.scalars().all()
    return responsables_hotels


async def get_one(db:AsyncSession, id_responsible_hotels:str):
    result = db.execute(select(ResponsablesHotels).where(ResponsablesHotels.id_responsible_hotels == id_responsible_hotels))
    responsable_hotel = result.scalar_one_or_none()
    return responsable_hotel
from sqlalchemy.ext.asyncio import AsyncSession
from app.crud import responsable_hoteles as responsable_hoteles_functions





async def get_responsable_hoteles(db: AsyncSession):
    result = await responsable_hoteles_functions.get_all(db=db)
    return result


async def get_one(db:AsyncSession, id_responsible_hotels:str):
    result = await responsable_hoteles_functions.get_one(db=db, id_responsible_hotels=id_responsible_hotels)
    return result
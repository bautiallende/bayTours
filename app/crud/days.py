from sqlalchemy.ext.asyncio import AsyncSession
from app.models.days import Days
from sqlalchemy.future import select


async def create(db:AsyncSession, days_data: Days):
    db.add(days_data)
    db.commit()
    db.refresh(days_data)
    return days_data


async def get_all(db:AsyncSession, id_group:str):
    result = db.execute(select(Days).where(Days.id_group == id_group))
    days_data = result.scalars().all()
    return days_data
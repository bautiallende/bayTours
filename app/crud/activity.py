from sqlalchemy.ext.asyncio import AsyncSession
from app.models.activity import Activity
from app.models.days import Days
from sqlalchemy.future import select
from sqlalchemy import and_



async def create(db: AsyncSession, activity_data: Activity):
    db.add(activity_data)
    db.commit()
    return activity_data


async def get_by_group_id(db: AsyncSession, id_group:str, id_optional:int|None):
    if id_optional:
        result = db.execute(select(Activity).join(Days, Days.id == Activity.id_days).where(and_(Days.id_group == id_group, Activity.id_optional == id_optional)))
    else:
        result = db.execute(select(Activity).join(Days, Days.id == Activity.id_days).where(Days.id_group == id_group))
    
    activity_data = result.scalars().all()
    return activity_data
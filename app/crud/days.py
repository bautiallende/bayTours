from sqlalchemy.ext.asyncio import AsyncSession
from collections import defaultdict
from app.models.days import Days
from sqlalchemy.future import select
from sqlalchemy import asc, desc



async def create(db:AsyncSession, days_data: Days):
    db.add(days_data)
    db.commit()
    db.refresh(days_data)
    return days_data


async def get_all(db:AsyncSession, id_group:str):
    result = db.execute(select(Days).where(Days.id_group == id_group))
    days_data = result.scalars().all()
    return days_data



async def get_dats_for_filter(db:AsyncSession, id_group:str):
    result = db.execute(
        select(Days.city).
        where(Days.id_group == id_group).order_by(Days.city.asc()).group_by(Days.city))
    return result.scalars().all()

async def get_day_id(db:AsyncSession, id_group:str ):
    result = db.execute(
        select(Days.id, Days.city, Days.date)
        .where(Days.id_group == id_group)
        .order_by(Days.date.asc()))
    rows = result.fetchall()

    city_days = defaultdict(list)
    for row in rows:
        city_days[row.city].append(row.id)

    return dict(city_days)
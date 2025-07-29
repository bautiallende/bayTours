from collections import defaultdict
from datetime import date

from sqlalchemy import asc, desc, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.days import Days
from app.models.cities import City


# ────────────────────────────────────────────────────────────────
# CREATE  (sin cambios)
# ────────────────────────────────────────────────────────────────
async def create(db: AsyncSession, days_data: Days):
    db.add(days_data)
    db.commit()
    db.refresh(days_data)
    return days_data


# ────────────────────────────────────────────────────────────────
# LISTAR todos los días de un grupo  (sin cambios)
# ────────────────────────────────────────────────────────────────
async def get_all(db: AsyncSession, id_group: str):
    result = db.execute(select(Days).where(Days.id_group == id_group))
    return result.scalars().all()


# ────────────────────────────────────────────────────────────────
# LISTA de ciudades distintas para filtros
# Devuelve nombres de ciudades, ordenados asc.
# ────────────────────────────────────────────────────────────────
async def get_dats_for_filter(db:AsyncSession, id_group:str):
    stmt = (
        select(City.name)
        .join(Days, Days.id_city == City.id)
        .where(Days.id_group == id_group)
        .group_by(City.name)
        .order_by(City.name.asc())
    )
    result = db.execute(stmt)
    return result.scalars().all()


# ────────────────────────────────────────────────────────────────
# MAPA  {city_name: [id_day, ...]}
# ────────────────────────────────────────────────────────────────
async def get_day_id(db:AsyncSession, id_group:str ):
    stmt = (
        select(Days.id, City.name.label("city"), Days.date)
        .join(City, City.id == Days.id_city)
        .where(Days.id_group == id_group)
        .order_by(Days.date.asc())
    )
    rows = (db.execute(stmt)).fetchall()

    city_days = defaultdict(list)
    for row in rows:
        city_days[row.city].append(row.id)

    return dict(city_days)


# ────────────────────────────────────────────────────────────────
# OBTENER un día por su PK
# ────────────────────────────────────────────────────────────────
async def get_day_by_id_days(db:AsyncSession, id_days:str):
    result = db.execute(
        select(Days).where(Days.id == id_days))
    return result.scalars().first()





async def get_day_by_group_and_city(db:AsyncSession, id_group:str, id_city:str):
    result = db.execute(
        select(Days).where(Days.id_group == id_group, Days.id_city == id_city))
    return result.scalars().all()


async def get_day_by_group_and_date(db:AsyncSession, id_group:str, date:date):
    result = db.execute(
        select(Days).where(Days.id_group == id_group, Days.date == date))
    return result.scalars().first()
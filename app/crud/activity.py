from sqlalchemy.ext.asyncio import AsyncSession
from app.models.activity import Activity
from app.models.days import Days
from app.models.optionals import Optionals
from app.models.local_guides import LocalGuides
from sqlalchemy.future import select
from sqlalchemy import and_
from typing import List, Optional
from datetime import date



async def create(db: AsyncSession, activity_data: Activity):
    db.add(activity_data)
    db.commit()
    return activity_data


async def get_by_group_id(db: AsyncSession, id_group:str, id_optional:int|None):
    if id_optional:
        result = db.execute(select(Activity).join(Days, Days.id == Activity.id_days).where(and_(Days.id_group == id_group, Activity.id_optional == id_optional)))
    else:
        result = db.execute(select(Activity).join(Days, Days.id == Activity.id_days).where(Days.id_group == id_group).order_by(Activity.date))
    
    activity_data = result.scalars().all()
    print(f'Activity data en get_by_group_id: {activity_data}')
    return activity_data


async def get_filters_by_group_id(db: AsyncSession, id_group:str, id_optional:int|None):
    if id_optional:
        result = db.execute(select(Activity).join(Days, Days.id == Activity.id_days).where(and_(Days.id_group == id_group, Activity.id_optional == id_optional)))
    else:
        result = db.execute(
            select(Activity, Optionals.name).
            join(Days, Days.id == Activity.id_days, isouter=True).
            join(Optionals, Activity.id_optional == Optionals.id_optional, isouter=True).
            where(Days.id_group == id_group).order_by(Activity.date))
    
    activity_data = result.fetchall()


    return [list(r) for r in activity_data] 


async def get_calendar_activities(
    db: AsyncSession,
    id_group: str,
    start: Optional[date] = None,
    end:   Optional[date] = None,
    id_optional: Optional[int] = None
):
    """
    Devuelve tuplas (Activity, Optional.name) para alimentar el calendario,
    aplicando filtros de grupo, rango de fechas y opcional si se indica.
    """
    stmt = (
        select(Activity, Optionals.name.label("optional_name"), LocalGuides.name.label("local_guide"))
        .join(Days, Days.id == Activity.id_days)
        .outerjoin(Optionals, Activity.id_optional == Optionals.id_optional)
        .outerjoin(LocalGuides, Activity.id_local_guide == LocalGuides.id_local_guide)
        .where(Days.id_group == id_group)
    )

    if id_optional:
        stmt = stmt.where(Activity.id_optional == id_optional)
    if start:
        stmt = stmt.where(Activity.date >= start)
    if end:
        stmt = stmt.where(Activity.date <= end)

    # Ordenar por fecha y hora
    stmt = stmt.order_by(Activity.date, Activity.time)

    result = db.execute(stmt)
    return result.fetchall()  # List[ (Activity, optional_name) ]

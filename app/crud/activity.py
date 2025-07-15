from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import IntegrityError, NoResultFound
from app.models.activity import Activity
from app.models.days import Days
from app.models.optionals import Optionals
from app.models.local_guides import LocalGuides
from app.schemas.activity import ActivityUpdate
from sqlalchemy.future import select
from sqlalchemy import and_
from typing import List, Optional
from datetime import date



async def create(db: AsyncSession, activity_data: Activity):
    db.add(activity_data)
    db.commit()
    return activity_data


# ────────────────────────────────────────────────────────────────
# UPDATE
# ────────────────────────────────────────────────────────────────
async def update_activity(
    db: AsyncSession,
    id_activity: str,
    payload: ActivityUpdate,
) -> Activity:
    activity = await get_activity(db, id_activity)

    # Usar model_dump para obtener solo los campos válidos
    for field, value in payload.model_dump(exclude_unset=True).items():
        if field == "status_optional" and value is not None:
            value = value.value
        setattr(activity, field, value)

    try:
        db.commit()
        db.refresh(activity)
    except IntegrityError:
        db.rollback()
        raise

    return activity


# ────────────────────────────────────────────────────────────────
# DELETE
# ────────────────────────────────────────────────────────────────
async def delete_activity(db: AsyncSession, id_activity: str) -> None:
    activity = await get_activity(db, id_activity)
    db.delete(activity)
    db.commit()


# ────────────────────────────────────────────────────────────────
# GET por id  (útil para service y update)
# ────────────────────────────────────────────────────────────────
async def get_activity(db: AsyncSession, id_activity: str) -> Activity:
    stmt = select(Activity).where(Activity.id == id_activity)
    res = db.execute(stmt)
    activity = res.scalar_one_or_none()
    if activity is None:
        raise NoResultFound
    return activity

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
        select(Activity, Optionals.name.label("optional_name"), LocalGuides.name.label("local_guide"), LocalGuides.surname.label("local_guide_surname"), Optionals.city)
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

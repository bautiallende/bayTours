from sqlalchemy.ext.asyncio import AsyncSession
from .activity_handler import activity_handlers
from app.models.activity import Activity
from app.crud import activity as activity_functions
from typing import List, Optional
from datetime import datetime, timedelta
from app.schemas.calendar import CalendarActivity



async def create(db:AsyncSession, activity_data: Activity, source: str = 'auto'):
    handler = activity_handlers.get(source)
    response = await handler.create(db=db, activity_data=activity_data)
    return response

async def update(
    db: AsyncSession,
    id_activity: str,
    activity_data: Activity,
):
    handler = activity_handlers.get('manual')     # sólo el manual permite updates
    return await handler.update(db, id_activity, activity_data)

async def update_pax(db: AsyncSession, id_activity: str, pax: int, operation: str = 'increment'):
    handler = activity_handlers.get('manual')     # sólo el manual permite updates
    return await handler.update_pax(db, id_activity, pax, operation)


async def delete(
    db: AsyncSession,
    id_activity: str,
):
    handler = activity_handlers.get('manual')
    await handler.delete(db, id_activity)


async def get_by_group_id(db:AsyncSession, id_group:str, id_optional:int=None):
    request = await activity_functions.get_by_group_id(db=db, id_group=id_group, id_optional=id_optional)
    return request


async def get_filters_by_group_id(db:AsyncSession, id_group:str, id_optional:int=None):
    request = await activity_functions.get_filters_by_group_id(db=db, id_group=id_group, id_optional=id_optional)
    return request


async def get_calendar_data(db: AsyncSession, id_group: str, start: Optional[str] = None, end: Optional[str] = None, filters: Optional[dict] = None
    ) -> List[CalendarActivity]:
    
    # Convertir filtros de fecha
    start_date = datetime.fromisoformat(start).date() if start else None
    end_date   = datetime.fromisoformat(end).date()   if end   else None

    id_optional = filters.get("optional") if filters else None

    rows = await activity_functions.get_calendar_activities(
        db=db,
        id_group=id_group,
        start=start_date,
        end=end_date,
        id_optional=id_optional
    )

    for row in rows:
        print(f"Actividades obtenidas: {row[0].__dict__} - {row[1]} - {row[2]}")
    events: List[CalendarActivity] = []
    for activity, id_optional, optional_name, id_local_guide, local_guide, local_guide_surname, phone, city in rows:
        # construye el title usando el nombre del optional (visita) y del guía
        if not optional_name:
            continue
        guide_name = local_guide if local_guide else "" + " " + local_guide_surname if local_guide_surname else ""
        title = f"{optional_name or 'Actividad'} – Guía {guide_name}"
        # start es date+time, end igual (usa duration si la tienes)
        start_dt = datetime.combine(activity.date, activity.time) if activity.time else activity.date
        # supongamos que cada actividad dura 2 horas, o usa activity.duration
        end_dt = start_dt + timedelta(hours=activity.duration or 2)

        events.append({
            'id':f"{activity.id}",
            'title':title,
            'start':start_dt,
            'end':end_dt,
            'id_local_guide':id_local_guide,
            'phone':phone,
            'guide':guide_name,
            'comments':activity.comment,
            'pax':activity.PAX,
            'time': activity.time.isoformat() if activity.time else None,
            'duration': activity.duration,
            'reservation_n': activity.reservation_n,
            'city': city,
            'id_optional':id_optional,
            'id_days': activity.id_days,
            'status_optional': activity.status_optional,
        })

    return events
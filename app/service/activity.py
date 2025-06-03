from sqlalchemy.ext.asyncio import AsyncSession
from .activity_handler import activity_handlers
from app.models.activity import Activity
from app.crud import activity as activity_functions
from typing import List, Optional
from datetime import datetime, timedelta
from app.schemas.calendar import CalendarActivity



async def create(db:AsyncSession, activity_data: Activity):
    handler = activity_handlers.get('create')
    response = await handler(db=db, activity_data=activity_data)
    return response


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

    events: List[CalendarActivity] = []
    for activity, optional_name, local_guide in rows:
        # construye el title usando el nombre del optional (visita) y del guía
        if not optional_name:
            continue
        title = f"{optional_name or 'Actividad'} – Guía {local_guide}"
        # start es date+time, end igual (usa duration si la tienes)
        start_dt = datetime.combine(activity.date, activity.time) if activity.time else activity.date
        # supongamos que cada actividad dura 2 horas, o usa activity.duration
        end_dt = start_dt + timedelta(hours=activity.duration or 2)

        events.append(CalendarActivity(
            id=f"act-{activity.id}",
            title=title,
            start=start_dt,
            end=end_dt,
            guide=local_guide,
            comments=activity.comment,
            pax=activity.PAX
        ))

    return events
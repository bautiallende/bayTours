from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from sqlalchemy.orm import Session
from ..dependencies import get_db
from datetime import timedelta
import json


from app.service import calendar as calendar_service
from app.schemas.calendar import CalendarEvent


router = APIRouter(prefix="/calendar", tags=["calendar"])


@router.get("/group/{id_group}", response_model=List[CalendarEvent])
async def get_group_calendar(
    id_group: str,
    start: Optional[str] = None,
    end: Optional[str] = None,
    filters: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Devuelve eventos de calendario para un grupo, incluyendo hoteles, actividades y permisos.
    Se pueden aplicar filtros y rango de fechas.
    """
    filters_dict = {}
    if filters:
        # parsea tu JSON de filtros aquí, p.ej. with json.loads
        filters_dict = json.loads(filters)

    events = await calendar_service.get_group_calendar_events(
        db=db,
        id_group=id_group,
        start=start,
        end=end,
        filters=filters_dict
    )
    print(f'\n\n eventos: {events}\n\n')
    if not events:
        raise HTTPException(status_code=404, detail="No hay eventos para este grupo")
    return events

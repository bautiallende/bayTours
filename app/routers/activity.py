from uuid import uuid4
from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session
from ..dependencies import get_db
from app.models.activity import Activity
from app.schemas.activity import (
    ActivityCreate,
    ActivityUpdate,
    ActivityRead,
)
from app.service import activity as activity_service



router = APIRouter(
    prefix="/activity",
    tags=["activity"],
)


# ────────────────────────────────────────────────────────────────
# CREATE  – POST
# ────────────────────────────────────────────────────────────────
@router.post(
    "/days/{id_days}/activities",
    response_model=ActivityRead,
    status_code=status.HTTP_201_CREATED,
)
async def create_activity_endpoint(
    id_days: str,
    payload: ActivityCreate,
    db: Session = Depends(get_db),
):
    """
    Añade manualmente una actividad opcional a un *día* del grupo.
    """
    activity_row = Activity(
        id=str(uuid4()),
        id_days=id_days,
        id_optional=payload.id_optional,
        id_local_guide=payload.id_local_guide,
        time=payload.time,
        duration=payload.duration,
        pax=payload.pax,
        reservation_n=payload.reservation_n,
        comment=payload.comment,
        status_optional=payload.status_optional.value,
        updated_by=payload.created_by,
    )
    return await activity_service.create(
        db=db,
        activity_data=activity_row,
        source="manual",   # ← dispatcher usará ManualActivitiesHandler
    )


# ────────────────────────────────────────────────────────────────
# UPDATE  – PATCH
# ────────────────────────────────────────────────────────────────
@router.patch(
    "/activities/{id_activity}",
    response_model=ActivityRead,
)
async def update_activity_endpoint(
    id_activity: str,
    payload: ActivityUpdate,
    db: Session = Depends(get_db),
):
    """
    Modifica una actividad: puede moverla a otro día, cambiar estado, PAX, etc.
    """
    # Convertimos el payload a ORM para el handler manual
    activity_row = Activity(**payload.model_dump(exclude={"updated_by"}, by_alias=True))
    return await activity_service.update(
        db=db,
        id_activity=id_activity,
        activity_data=activity_row,
    )


# ────────────────────────────────────────────────────────────────
# DELETE  – DELETE
# ────────────────────────────────────────────────────────────────
@router.delete(
    "/activities/{id_activity}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_activity_endpoint(
    id_activity: str,
    db: Session = Depends(get_db),
):
    """
    Elimina una actividad opcional de un día.
    """
    await activity_service.delete(db=db, id_activity=id_activity)
    return Response(status_code=status.HTTP_204_NO_CONTENT)



@router.get('/activity_by_id_group')
async def activity_by_id_group(id_group:str, db:Session = Depends(get_db)):
    result = await activity_service.get_filters_by_group_id(db=db, id_group=id_group)

    if not result:
        raise HTTPException(status_code=404, detail="No activities found for this group")
    return result
from typing import List

from fastapi import APIRouter, Depends, Response, status, HTTPException
from sqlalchemy.orm import Session
from datetime import date

from ..dependencies import get_db
from app.schemas.day_transports import (
    DayTransportCreate,
    DayTransportRead,
    DayTransportUpdate,
)
from app.service.day_transports import (
    create_transport,
    list_transports,
    update_transport,
    delete_transport,
    get_transports_by_id_group
)
from app.service.days import get_date_by_group_and_date

router = APIRouter(tags=["day_transports"])


# ────────────────────────────────────────────────────────────────
# CREATE  – POST
# ────────────────────────────────────────────────────────────────
@router.post(
    "/days/{id_day}/transports",
    response_model=DayTransportRead,
    status_code=status.HTTP_201_CREATED,
)
async def create_day_transport_endpoint(
    id_day: str,
    payload: DayTransportCreate,
    db:Session = Depends(get_db),
):
    """
    Añade un transporte real (p. ej. billete de ferry) al día indicado.
    """
    return await create_transport(db, id_day, payload)

@router.post(
    "/days/{id_group}/{day_date}/transports_date",
    response_model=DayTransportRead,
    status_code=status.HTTP_201_CREATED,
)
async def create_day_transport_endpoint_by_date(
    day_date: date,
    id_group: str,
    payload: DayTransportCreate,
    db:Session = Depends(get_db),
):
    """
    Añade un transporte real (p. ej. billete de ferry) al día indicado.
    """
    day_data = await get_date_by_group_and_date(db, id_group, day_date)
    if not day_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No se encontró el día para el grupo y la fecha especificados."
        )
    id_day = day_data.id
    return await create_transport(db, id_day, payload)


# ────────────────────────────────────────────────────────────────
# LIST  – GET
# ────────────────────────────────────────────────────────────────
@router.get(
    "/days/{id_day}/transports",
    response_model=List[DayTransportRead],
)
async def list_day_transports_endpoint(
    id_day: str,
    db:Session = Depends(get_db),
):
    """
    Lista todos los transportes asignados a un día concreto del grupo.
    """
    return await list_transports(db, id_day)


@router.get(
    "/groups/{id_group}/day-transports",
    response_model=List[DayTransportRead],
)
async def get_day_transports_by_id_group_endpoint(
    id_group: str,
    db: Session = Depends(get_db),
):
    """
    Devuelve todos los transportes asignados a un grupo concreto.
    """
    return await get_transports_by_id_group(db, id_group)


# ────────────────────────────────────────────────────────────────
# UPDATE  – PATCH
# ────────────────────────────────────────────────────────────────
@router.patch(
    "/day-transports/{transport_id}",
    response_model=DayTransportRead,
)
async def update_day_transport_endpoint(
    transport_id: int,
    payload: DayTransportUpdate,
    db:Session = Depends(get_db),
):
    """
    Permite completar o modificar los datos reales del transporte (operador,
    localizador, hora de salida, etc.).
    """
    return await update_transport(db, transport_id, payload)


# ────────────────────────────────────────────────────────────────
# DELETE  – DELETE
# ────────────────────────────────────────────────────────────────
@router.delete(
    "/day-transports/{transport_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_day_transport_endpoint(
    transport_id: int,
    db:Session = Depends(get_db),
):
    """
    Elimina un transporte asignado al día (si se cancela o se ingresa por error).
    """
    await delete_transport(db, transport_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
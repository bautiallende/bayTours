from typing import List

from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.orm import Session

from ..dependencies import get_db
from app.schemas.stage_transports import (
    StageTransportCreate,
    StageTransportUpdate,
    StageTransportRead,
)
from app.service.stage_transports import (
    create_transport,
    list_transports,
    update_transport,
    delete_transport,
)

router = APIRouter(tags=["stage_transports"])


# ────────────────────────────────────────────────────────────────
# CREATE  – POST
# ────────────────────────────────────────────────────────────────
@router.post(
    "/circuit-stages/{stage_id}/transports",
    response_model=StageTransportRead,
    status_code=status.HTTP_201_CREATED,
)
async def create_stage_transport_endpoint(
    stage_id: int,
    payload: StageTransportCreate,
    db:Session = Depends(get_db),
):
    """
    Añade un transporte *plantilla* (por defecto) a una etapa del circuito.
    """
    return await create_transport(db, stage_id, payload)


# ────────────────────────────────────────────────────────────────
# LIST  – GET
# ────────────────────────────────────────────────────────────────
@router.get(
    "/circuit-stages/{stage_id}/transports",
    response_model=List[StageTransportRead],
)
async def list_stage_transports_endpoint(
    stage_id: int,
    db:Session = Depends(get_db),
):
    """
    Devuelve todos los transportes definidos para la etapa indicada.
    """
    return await list_transports(db, stage_id)


# ────────────────────────────────────────────────────────────────
# UPDATE  – PATCH
# ────────────────────────────────────────────────────────────────
@router.patch(
    "/stage-transports/{transport_id}",
    response_model=StageTransportRead,
)
async def update_stage_transport_endpoint(
    transport_id: int,
    payload: StageTransportUpdate,
    db:Session = Depends(get_db),
):
    """
    Modifica un transporte-plantilla concreto.
    """
    return await update_transport(db, transport_id, payload)


# ────────────────────────────────────────────────────────────────
# DELETE  – DELETE
# ────────────────────────────────────────────────────────────────
@router.delete(
    "/stage-transports/{transport_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_stage_transport_endpoint(
    transport_id: int,
    db:Session = Depends(get_db),
):
    """
    Elimina un transporte-plantilla de la etapa.
    """
    await delete_transport(db, transport_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
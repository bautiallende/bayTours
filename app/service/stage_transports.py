from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError, NoResultFound
from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas.stage_transports import (
    StageTransportCreate,
    StageTransportUpdate,
    StageTransportRead,
)
from app.crud.stage_transports import (
    create_transport as crud_create,
    get_transport as crud_get,
    list_transports as crud_list,
    update_transport as crud_update,
    delete_transport as crud_delete,
)


# ────────────────────────────────────────────────────────────────
# CREATE
# ────────────────────────────────────────────────────────────────
async def create_transport(
    db: AsyncSession,
    stage_id: int,
    payload: StageTransportCreate,
) -> StageTransportRead:
    try:
        t = await crud_create(db, stage_id, payload)
    except NoResultFound:
        raise HTTPException(404, "Circuit stage not found.")
    except IntegrityError:
        raise HTTPException(409, "Duplicate transport or other constraint error.")

    return StageTransportRead.model_validate(t, from_attributes=True)


# ────────────────────────────────────────────────────────────────
# LIST
# ────────────────────────────────────────────────────────────────
async def list_transports(
    db: AsyncSession,
    stage_id: int,
):
    try:
        ts = await crud_list(db, stage_id)
    except NoResultFound:
        raise HTTPException(404, "Circuit stage not found.")

    return [StageTransportRead.model_validate(x, from_attributes=True) for x in ts]


# ────────────────────────────────────────────────────────────────
# UPDATE
# ────────────────────────────────────────────────────────────────
async def update_transport(
    db: AsyncSession,
    transport_id: int,
    payload: StageTransportUpdate,
) -> StageTransportRead:
    try:
        t = await crud_update(db, transport_id, payload)
    except NoResultFound:
        raise HTTPException(404, "Stage-transport not found.")
    except IntegrityError:
        raise HTTPException(409, "Conflict while updating stage-transport.")

    return StageTransportRead.model_validate(t, from_attributes=True)


# ────────────────────────────────────────────────────────────────
# DELETE
# ────────────────────────────────────────────────────────────────
async def delete_transport(db: AsyncSession, transport_id: int) -> None:
    try:
        await crud_delete(db, transport_id)
    except NoResultFound:
        raise HTTPException(404, "Stage-transport not found.")
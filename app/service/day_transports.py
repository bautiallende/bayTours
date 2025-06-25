from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError, NoResultFound
from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas.day_transports import (
    DayTransportCreate,
    DayTransportUpdate,
    DayTransportRead,
)
from app.crud.day_transports import (
    create_transport as crud_create,
    list_transports as crud_list,
    get_transport as crud_get,
    update_transport as crud_update,
    delete_transport as crud_delete,
    get_transports_by_id_group as crud_get_by_id_group,
)


# ────────────────────────────────────────────────────────────────
# CREATE
# ────────────────────────────────────────────────────────────────
async def create_transport(
    db: AsyncSession,
    id_day: str,
    payload: DayTransportCreate,
) -> DayTransportRead:
    try:
        t = await crud_create(db, id_day, payload)
    except NoResultFound:
        raise HTTPException(status_code=404, detail="Day not found.")
    except IntegrityError:
        raise HTTPException(status_code=409, detail="Constraint violation.")

    return DayTransportRead.model_validate(t, from_attributes=True)


# ────────────────────────────────────────────────────────────────
# LIST
# ────────────────────────────────────────────────────────────────
async def list_transports(
    db: AsyncSession,
    id_day: str,
) -> list[DayTransportRead]:
    try:
        ts = await crud_list(db, id_day)
    except NoResultFound:
        raise HTTPException(status_code=404, detail="Day not found.")

    return [DayTransportRead.model_validate(x, from_attributes=True) for x in ts]


async def get_transports_by_id_group(db: AsyncSession, id_group: str) -> list[DayTransportRead]:
    try:
        ts = await crud_get_by_id_group(db, id_group)
    except NoResultFound:
        raise HTTPException(status_code=404, detail="Group not found.")

    return [DayTransportRead.model_validate(x, from_attributes=True) for x in ts]



# ────────────────────────────────────────────────────────────────
# UPDATE
# ────────────────────────────────────────────────────────────────
async def update_transport(
    db: AsyncSession,
    id_transport: int,
    payload: DayTransportUpdate,
) -> DayTransportRead:
    try:
        t = await crud_update(db, id_transport, payload)
    except NoResultFound:
        raise HTTPException(status_code=404, detail="Transport not found.")
    except IntegrityError:
        raise HTTPException(status_code=409, detail="Conflict while updating.")

    return DayTransportRead.model_validate(t, from_attributes=True)


# ────────────────────────────────────────────────────────────────
# DELETE
# ────────────────────────────────────────────────────────────────
async def delete_transport(
    db: AsyncSession,
    id_transport: int,
) -> None:
    try:
        await crud_delete(db, id_transport)
    except NoResultFound:
        raise HTTPException(status_code=404, detail="Transport not found.")
from __future__ import annotations

from typing import Sequence

from sqlalchemy import select, update, delete
from sqlalchemy.exc import IntegrityError, NoResultFound
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.stage_transports import StageTransport
from app.models.circuit_stages import CircuitStage
from app.schemas.stage_transports import (
    StageTransportCreate,
    StageTransportUpdate,
)


# ────────────────────────────────────────────────────────────────
# HELPERS
# ────────────────────────────────────────────────────────────────
async def _ensure_stage_exists(db: AsyncSession, stage_id: int) -> None:
    stmt = select(CircuitStage.id_stage).where(CircuitStage.id_stage == stage_id)
    if (db.execute(stmt)).scalar_one_or_none() is None:
        raise NoResultFound


# ────────────────────────────────────────────────────────────────
# CREATE
# ────────────────────────────────────────────────────────────────
async def create_transport(
    db: AsyncSession,
    stage_id: int,
    payload: StageTransportCreate,
) -> StageTransport:
    await _ensure_stage_exists(db, stage_id)

    new_t = StageTransport(
        id_stage=stage_id,
        mode=payload.mode.value,
        operator_name=payload.operator_name,
        transport_code=payload.reference_code,
        notes=payload.notes,
        updated_by=payload.updated_by,
        depart_time=payload.depart_time,
    )
    db.add(new_t)
    try:
        db.commit()
        db.refresh(new_t)
    except IntegrityError:
        db.rollback()
        raise

    return new_t


# ────────────────────────────────────────────────────────────────
# READ (one / list)
# ────────────────────────────────────────────────────────────────
async def get_transport(db: AsyncSession, transport_id: int) -> StageTransport:
    stmt = select(StageTransport).where(StageTransport.id_transport == transport_id)
    result = db.execute(stmt)
    t = result.scalar_one_or_none()
    if t is None:
        raise NoResultFound
    return t


async def list_transports(
    db: AsyncSession,
    stage_id: int,
) -> Sequence[StageTransport]:
    await _ensure_stage_exists(db, stage_id)
    stmt = (
        select(StageTransport)
        .where(StageTransport.id_stage == stage_id)
        .order_by(StageTransport.id_transport)
    )
    result = db.execute(stmt)
    return result.scalars().all()


# ────────────────────────────────────────────────────────────────
# UPDATE
# ────────────────────────────────────────────────────────────────
async def update_transport(
    db: AsyncSession,
    transport_id: int,
    payload: StageTransportUpdate,
) -> StageTransport:
    t = await get_transport(db, transport_id)

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(t, field, value)

    try:
        db.commit()
        db.refresh(t)
    except IntegrityError:
        db.rollback()
        raise

    return t


# ────────────────────────────────────────────────────────────────
# DELETE
# ────────────────────────────────────────────────────────────────
async def delete_transport(db: AsyncSession, transport_id: int) -> None:
    t = await get_transport(db, transport_id)
    db.delete(t)
    db.commit()

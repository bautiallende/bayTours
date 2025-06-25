from __future__ import annotations

from typing import Sequence

from sqlalchemy import select, update, delete
from sqlalchemy.exc import IntegrityError, NoResultFound
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.day_transports import DayTransport
from app.models.days import Days
from app.schemas.day_transports import (
    DayTransportCreate,
    DayTransportUpdate,
)


# ────────────────────────────────────────────────────────────────
# HELPERS
# ────────────────────────────────────────────────────────────────
async def _ensure_day_exists(db: AsyncSession, id_day: str) -> None:
    stmt = select(Days.id).where(Days.id == id_day)
    if (db.execute(stmt)).scalar_one_or_none() is None:
        raise NoResultFound


# ────────────────────────────────────────────────────────────────
# CREATE
# ────────────────────────────────────────────────────────────────
async def create_transport(
    db: AsyncSession,
    id_day: str,
    payload: DayTransportCreate,
) -> DayTransport:
    await _ensure_day_exists(db, id_day)

    new_t = DayTransport(
        id_day=id_day,
        mode=payload.mode.value,
        operator_name=payload.operator_name,
        reference_code=payload.reference_code,
        departure_time=payload.departure_time,
        notes=payload.notes,
        updated_by=payload.updated_by,
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
async def get_transport(db: AsyncSession, transport_id: int) -> DayTransport:
    stmt = select(DayTransport).where(DayTransport.id_transport == transport_id)
    result = db.execute(stmt)
    t = result.scalar_one_or_none()
    if t is None:
        raise NoResultFound
    return t


async def list_transports(
    db: AsyncSession,
    id_day: str,
) -> Sequence[DayTransport]:
    await _ensure_day_exists(db, id_day)

    stmt = (
        select(DayTransport)
        .where(DayTransport.id_day == id_day)
        .order_by(DayTransport.id_transport)
    )
    result = db.execute(stmt)
    return result.scalars().all()


async def get_transports_by_id_group(db: AsyncSession, id_group: str) -> Sequence[DayTransport]:
    stmt = (
        select(DayTransport)
        .join(Days, Days.id == DayTransport.id_day)
        .where(Days.id_group == id_group)
        .order_by(DayTransport.id_transport)
    )
    result = db.execute(stmt)
    return result.scalars().all()

# ────────────────────────────────────────────────────────────────
# UPDATE
# ────────────────────────────────────────────────────────────────
async def update_transport(
    db: AsyncSession,
    transport_id: int,
    payload: DayTransportUpdate,
) -> DayTransport:
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
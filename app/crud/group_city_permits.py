from __future__ import annotations

from typing import Sequence

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError, NoResultFound
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.group_city_permits import GroupCityPermit
from app.models.cities import City
from app.schemas.group_city_permits import (
    GroupCityPermitCreate,
    GroupCityPermitUpdate,
)


# ────────────────────────────────────────────────────────────────
# CREATE
# ────────────────────────────────────────────────────────────────
async def create_permit(
    db: AsyncSession,
    payload: GroupCityPermitCreate,
) -> GroupCityPermit:
    permit = GroupCityPermit(
        id_permit=payload.id_permit,      # normalmente uuid generado arriba
        id_group=payload.id_group,
        id_city=payload.id_city,
        id_transport=payload.id_transport,
        valid_from=payload.valid_from,
        valid_to=payload.valid_to,
        status=payload.status.value,
        permit_number=payload.permit_number,
        managed_by=payload.managed_by,
        provider=payload.provider,
        price=payload.price,
        payed_with=payload.payed_with,
        payment_date=payload.payment_date,
        comments=payload.comments,
        updated_by=payload.updated_by,
    )
    db.add(permit)
    try:
        db.commit()
        db.refresh(permit)
    except IntegrityError:
        db.rollback()
        raise

    return permit


# ────────────────────────────────────────────────────────────────
# READ helpers
# ────────────────────────────────────────────────────────────────
async def get_permit(db: AsyncSession, id_permit: str) -> GroupCityPermit:
    stmt = select(GroupCityPermit).where(GroupCityPermit.id_permit == id_permit)
    result = db.execute(stmt)
    p = result.scalar_one_or_none()
    if p is None:
        raise NoResultFound
    return p


async def list_permits_by_group(
    db: AsyncSession,
    id_group: str,
) -> Sequence[GroupCityPermit]:
    stmt = (
    select(GroupCityPermit)
    .options(selectinload(GroupCityPermit.city))   # precarga nombre ciudad
    .where(GroupCityPermit.id_group == id_group)
    .order_by(GroupCityPermit.id_city)
    )
    result = db.execute(stmt)
    return result.scalars().all()


# ────────────────────────────────────────────────────────────────
# UPDATE
# ────────────────────────────────────────────────────────────────
async def update_permit(
    db: AsyncSession,
    id_permit: str,
    payload: GroupCityPermitUpdate,
) -> GroupCityPermit:
    permit = await get_permit(db, id_permit)

    for field, value in payload.model_dump(exclude_unset=True).items():
        # status enum → str
        if field == "status" and value is not None:
            value = value.value
        setattr(permit, field, value)

    try:
        db.commit()
        db.refresh(permit)
    except IntegrityError:
        db.rollback()
        raise

    return permit


# ────────────────────────────────────────────────────────────────
# DELETE
# ────────────────────────────────────────────────────────────────
async def delete_permit(db: AsyncSession, id_permit: str) -> None:
    permit = await get_permit(db, id_permit)
    db.delete(permit)
    db.commit()
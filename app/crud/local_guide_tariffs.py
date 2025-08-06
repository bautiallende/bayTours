from __future__ import annotations

from typing import Sequence
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError, NoResultFound
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import delete
from app.models.local_guide_tariffs import LocalGuideTariff
from app.schemas.local_guides import LocalGuideTariffCreate


# ────────────────────────────────────────────────────────────────
# CREATE
# ────────────────────────────────────────────────────────────────
async def create_tariff(
    db: AsyncSession,
    tariff_data: LocalGuideTariffCreate,
    id_local_guide: int,
) -> LocalGuideTariff:
    obj = LocalGuideTariff(
        **tariff_data.model_dump(exclude_none=True),
        id_local_guide=id_local_guide,
    )
    db.add(obj)
    try:
        db.commit()
        db.refresh(obj)
    except IntegrityError:
        db.rollback()
        raise
    return obj


# ────────────────────────────────────────────────────────────────
# LIST por guía
# ────────────────────────────────────────────────────────────────
async def list_tariffs(
    db: AsyncSession,
    id_local_guide: int,
) -> Sequence[LocalGuideTariff]:
    res = db.execute(
        select(LocalGuideTariff).where(LocalGuideTariff.id_local_guide == id_local_guide)
    )
    return res.scalars().all()


# ────────────────────────────────────────────────────────────────
# DELETE uno
# ────────────────────────────────────────────────────────────────
async def delete_tariff(db: AsyncSession, id_tariff: int) -> None:
    stmt = delete(LocalGuideTariff).where(LocalGuideTariff.id_tariff == id_tariff)
    await db.execute(stmt)
    db.commit()


# ────────────────────────────────────────────────────────────────
# DELETE todos los de un guía
# ────────────────────────────────────────────────────────────────
async def delete_all_tariffs_by_guide(
    db: AsyncSession,
    id_local_guide: int,
) -> None:
    stmt = delete(LocalGuideTariff).where(
        LocalGuideTariff.id_local_guide == id_local_guide
    )
    db.execute(stmt)
    db.commit()
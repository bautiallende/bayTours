from sqlalchemy.ext.asyncio import AsyncSession
from app.models.permit import CityPermitRequirement
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from datetime import datetime
from typing import Optional


async def get_city_permit(db: AsyncSession, code: str) -> CityPermitRequirement | None:
    result = db.execute(
        select(CityPermitRequirement).where(CityPermitRequirement.code == code)
    )
    return result.scalars().first()


async def list_city_permits(db: AsyncSession) -> list[CityPermitRequirement]:
    result = await db.execute(select(CityPermitRequirement))
    return result.scalars().all()

async def create_city_permit(db: AsyncSession, data: CityPermitRequirement) -> CityPermitRequirement:
    db.add(data)
    db.commit()
    db.refresh(data)
    return data

async def update_city_permit(
    db: AsyncSession,
    existing: CityPermitRequirement,
    permit_needed: bool,
    comment: Optional[str],
    updated_by: str
) -> CityPermitRequirement:
    existing.permit_needed = permit_needed
    existing.comment = comment
    existing.updated_at = datetime.utcnow()
    existing.updated_by = updated_by
    await db.commit()
    await db.refresh(existing)
    return existing



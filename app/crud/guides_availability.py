from sqlalchemy.ext.asyncio import AsyncSession
from app.models.guide_availability import GuideAvailability
from app.models.guides import Guides
from sqlalchemy.future import select
from datetime import date
from sqlalchemy import select, and_, or_, not_
from sqlalchemy.orm import aliased

async def create(db:AsyncSession, slot:GuideAvailability):
    db.add(slot)
    db.commit()
    return slot



async def get_slots(db:AsyncSession, id_guide:str):
    result = db.execute(select(GuideAvailability).where(GuideAvailability.id_guide == id_guide))
    slots = result.scalars().all()
    return slots


async def get_available_guides(starting_date: date, ending_date: date, db: AsyncSession):
    # Alias para las tablas
    GuideAvailabilityAlias = aliased(GuideAvailability)

    # Subconsulta para identificar los guías ocupados en el rango de fechas
    busy_guides_subquery = (
        select(GuideAvailabilityAlias.id_guide)
        .where(
            and_(
                GuideAvailabilityAlias.start_date < ending_date,
                GuideAvailabilityAlias.end_date > starting_date
            )
        )
        .subquery()
    )

    # Consulta para obtener los guías disponibles
    result = db.execute(
        select(Guides)
        .where(
            Guides.active.is_(True),  # Solo guías activos
            Guides.id_guide.not_in(busy_guides_subquery)  # Excluir los guías ocupados
        )
    )

    available_guides = result.scalars().all()
    return available_guides


async def delete_slot(db:AsyncSession, id_guide:int, id_group:str):
    slot = db.query(GuideAvailability).filter(GuideAvailability.id_guide == id_guide, GuideAvailability.id_group == id_group).first()
    if slot:
        db.delete(slot)
        db.commit()
        return True
    else:
        return False

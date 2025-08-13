from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from datetime import date
from sqlalchemy import select, and_, or_, not_, delete
from sqlalchemy.orm import aliased
from sqlalchemy.exc import NoResultFound
from app.models.guide_availability import GuideAvailability
from app.models.guides import Guides
from app.schemas.guides import GuideAvailabilityUpdate




async def create_slot(db: AsyncSession, slot: GuideAvailability):
    db.add(slot)
    db.commit()
    db.refresh(slot)
    return slot


async def list_slots(db: AsyncSession, id_guide: int):
    res = db.execute(
        select(GuideAvailability).where(GuideAvailability.id_guide == id_guide)
    )
    return res.scalars().all()


async def update_slot(db: AsyncSession, id_availability: int, payload: GuideAvailabilityUpdate,):
    slot = await db.get(GuideAvailability, id_availability)
    if slot is None:
        raise NoResultFound

    for k, v in payload.model_dump(exclude={"id_availability"}).items():
        setattr(slot, k, v)

    await db.commit()
    await db.refresh(slot)
    return slot


# async def delete_slot(db: AsyncSession, id_availability: int):
#     db.execute(
#         delete(GuideAvailability).where(
#             GuideAvailability.id_availability == id_availability
#         )
#     )
#     db.commit()



async def get_available_guides(starting_date: date, ending_date: date, db: AsyncSession):
    # Alias para las tablas
    GuideAvailabilityAlias = aliased(GuideAvailability)

    # Subconsulta para identificar los guías ocupados en el rango de fechas
    busy_guides_subquery = (
        select(GuideAvailabilityAlias.id_guide)
        .where(
            and_(
                GuideAvailabilityAlias.start_date <= ending_date,
                GuideAvailabilityAlias.end_date >= starting_date
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

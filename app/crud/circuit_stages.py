from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.circuit_stages import CircuitStages
from app.schemas.circuit_stage import StageCreate, StageUpdate
from app.crud.city import get_or_create_city



async def get_circuit_stages(db:AsyncSession, id_circuit:str):
    result = db.execute(select(CircuitStages).where(CircuitStages.id_circuit == id_circuit).order_by(CircuitStages.stage_order))
    return result.scalars().all()



async def get_stage_by_id(db: AsyncSession, stage_id: int) -> CircuitStages | None:
    return db.get(CircuitStages, stage_id)

async def get_stages_by_circuit(db: AsyncSession, circuit_id: int) -> list[CircuitStages]:
    result = db.execute(
        select(CircuitStages)
        .where(CircuitStages.id_circuit == circuit_id)
        .order_by(CircuitStages.stage_order)
    )
    return result.scalars().all()

async def create_stage(db: AsyncSession, circuit_id: int, data: StageCreate) -> CircuitStages:
    # Normalize or create city
    city = await get_or_create_city(db, data.city_name, data.country)
    new = CircuitStages(
        id_circuit  = circuit_id,
        city_id     = city.id,
        stage_order = data.stage_order,
        ferry       = data.ferry
    )
    db.add(new)
    db.commit()
    db.refresh(new)
    return new

async def update_stage(db: AsyncSession, stage_id: int, data: StageUpdate) -> CircuitStages | None:
    stage = db.get(CircuitStages, stage_id)
    if not stage:
        return None
    # Update city if provided
    if data.city_name:
        city = await get_or_create_city(db, data.city_name, data.country)
        stage.city_id = city.id
    # Update remaining fields
    for field, value in data.dict(exclude_unset=True, exclude={"city_name","country"}).items():
        setattr(stage, field, value)
    db.commit()
    db.refresh(stage)
    return stage

async def delete_stage(db: AsyncSession, stage_id: int) -> bool:
    stage = db.get(CircuitStages, stage_id)
    if not stage:
        return False
    db.delete(stage)
    db.commit()
    return True
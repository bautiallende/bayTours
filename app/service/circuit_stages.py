from sqlalchemy.ext.asyncio import AsyncSession
from app.crud import circuit_stages as circuit_stages_funtions
from typing import List
from app.crud.circuit_stages import (
    get_stage_by_id, get_stages_by_circuit,
    create_stage as crud_create_stage,
    update_stage as crud_update_stage,
    delete_stage as crud_delete_stage
)
from app.schemas.circuit import StageCreate, StageRead, StageUpdate
from app.crud.city import get_city_by_id, get_city_by_name


async def get_circuit_stage(db:AsyncSession, id_circuit:str):
    result = await circuit_stages_funtions.get_circuit_stages(db=db, id_circuit=id_circuit)
    return result

async def create_stage(db: AsyncSession, circuit_id: int, data: StageCreate) -> StageRead:
    stage = await crud_create_stage(db, circuit_id, data)
    print(f"Stage created: {stage.__dict__}")
    city = await get_city_by_id(db, stage.city_id)
    print(f"City found: {city.__dict__}")
    return StageRead.model_validate({
        **stage.__dict__,
        "city_name": city.name,
        "country":   city.country,
    })

async def list_stages(db: AsyncSession, circuit_id: int) -> List[StageRead]:
    stages = await get_stages_by_circuit(db, circuit_id)
    print(f"Stages found: {len(stages)}")
    reads = []
    for s in stages:
        city = await get_city_by_name(db, s.city_id)
        reads.append(
            StageRead.model_validate({
                **s.__dict__,
                "city_name": city.name,
                "country":   city.country
            })
        )
    return reads

async def get_stage(db: AsyncSession, stage_id: int) -> StageRead | None:
    stage = await get_stage_by_id(db, stage_id)
    if not stage:
        return None
    city = await get_city_by_name(db, stage.city_id)
    return StageRead.model_validate({
        **stage.__dict__,
        "city_name": city.name,
        "country":   city.country
    })

async def update_stage(db: AsyncSession, stage_id: int, data: StageUpdate) -> StageRead | None:
    stage = await crud_update_stage(db, stage_id, data)
    if not stage:
        return None
    city = await get_city_by_name(db, stage.city_id)
    return StageRead.model_validate({
        **stage.__dict__,
        "city_name": city.name,
        "country":   city.country
    })

async def delete_stage(db: AsyncSession, stage_id: int) -> bool:
    return await crud_delete_stage(db, stage_id)
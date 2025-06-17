from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError, NoResultFound
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.cities import City
from app.crud.circuit_stages import (
    create_stage as crud_create,
    list_stages as crud_list,
    get_stage as crud_get,
    update_stage as crud_update,
    delete_stage as crud_delete,
)
from app.schemas.circuit_stage import (
    CircuitStageCreate,
    CircuitStageUpdate,
    CircuitStageRead,
)


# ────────────────────────────────────────────────────────────────
# HELPERS
# ────────────────────────────────────────────────────────────────
async def _ensure_city_exists(db: AsyncSession, city_id: int) -> None:
    """Lanza 422 si la ciudad no existe en la tabla `cities`."""
    stmt = select(City).where(City.id == city_id)
    result = db.execute(stmt).scalar_one_or_none()
    if result is None:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"City with id {city_id} does not exist.",
        )
    return result


# ────────────────────────────────────────────────────────────────
# CREATE
# ────────────────────────────────────────────────────────────────
async def create_stage(
    db: AsyncSession,
    circuit_id: int,
    payload: CircuitStageCreate,
) -> CircuitStageRead:
    city = await _ensure_city_exists(db, payload.city_id)

    try:
        stage = await crud_create(db, circuit_id, payload, city_name=city.name)
    except IntegrityError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Stage order {payload.stage_order} already exists for circuit {circuit_id}.",
        )

    return CircuitStageRead.model_validate(stage, from_attributes=True)


# ────────────────────────────────────────────────────────────────
# LIST
# ────────────────────────────────────────────────────────────────
async def list_stages(
    db: AsyncSession,
    circuit_id: int,
) -> list[CircuitStageRead]:
    stages = await crud_list(db, circuit_id)
    return [CircuitStageRead.model_validate(s, from_attributes=True) for s in stages]



# ────────────────────────────────────────────────────────────────
# UPDATE
# ────────────────────────────────────────────────────────────────
async def update_stage(
    db: AsyncSession,
    stage_id: int,
    payload: CircuitStageUpdate,
) -> CircuitStageRead:
    if payload.city_id is not None:
        await _ensure_city_exists(db, payload.city_id)

    try:
        stage = await crud_update(db, stage_id, payload)
    except NoResultFound:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Stage not found.",
        )
    except IntegrityError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Duplicate stage_order within the same circuit.",
        )

    return CircuitStageRead.model_validate(stage, from_attributes=True)


# ────────────────────────────────────────────────────────────────
# DELETE
# ────────────────────────────────────────────────────────────────
async def delete_stage(db: AsyncSession, stage_id: int) -> None:
    try:
        await crud_delete(db, stage_id)
    except NoResultFound:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Stage not found.",
        )

# async def create_stage(db: AsyncSession, circuit_id: int, data: StageCreate) -> StageRead:
#     stage = await crud_create_stage(db, circuit_id, data)
#     print(f"Stage created: {stage.__dict__}")
#     city = await get_city_by_id(db, stage.city_id)
#     print(f"City found: {city.__dict__}")
#     return StageRead.model_validate({
#         **stage.__dict__,
#         "city_name": city.name,
#         "country":   city.country,
#     })

# async def list_stages(db: AsyncSession, circuit_id: int) -> List[StageRead]:
#     stages = await get_stages_by_circuit(db, circuit_id)
#     print(f"Stages found: {len(stages)}")
#     reads = []
#     for s in stages:
#         city = await get_city_by_name(db, s.city_id)
#         reads.append(
#             StageRead.model_validate({
#                 **s.__dict__,
#                 "city_name": city.name,
#                 "country":   city.country
#             })
#         )
#     return reads

# async def get_stage(db: AsyncSession, stage_id: int) -> StageRead | None:
#     stage = await get_stage_by_id(db, stage_id)
#     if not stage:
#         return None
#     city = await get_city_by_name(db, stage.city_id)
#     return StageRead.model_validate({
#         **stage.__dict__,
#         "city_name": city.name,
#         "country":   city.country
#     })

# async def update_stage(db: AsyncSession, stage_id: int, data: StageUpdate) -> StageRead | None:
#     stage = await crud_update_stage(db, stage_id, data)
#     if not stage:
#         return None
#     city = await get_city_by_name(db, stage.city_id)
#     return StageRead.model_validate({
#         **stage.__dict__,
#         "city_name": city.name,
#         "country":   city.country
#     })

# async def delete_stage(db: AsyncSession, stage_id: int) -> bool:
#     return await crud_delete_stage(db, stage_id)
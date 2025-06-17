from __future__ import annotations

from typing import Sequence

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError, NoResultFound
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.circuit_stages import CircuitStage
from app.models.stage_transports import StageTransport
from app.schemas.circuit_stage import (
    CircuitStageCreate,
    CircuitStageUpdate,
    StageTransportCreate,
)


# ────────────────────────────────────────────────────────────────
# HELPERS
# ────────────────────────────────────────────────────────────────
def _build_transport(
    payload: StageTransportCreate,
    author: str,
) -> StageTransport:
    """Factory interna para convertir schema → modelo ORM."""
    return StageTransport(
        mode=payload.mode,
        operator_name=payload.operator_name,
        reference_code=payload.reference_code,
        notes=payload.notes,
        updated_by=author,
    )


# ────────────────────────────────────────────────────────────────
# CREATE
# ────────────────────────────────────────────────────────────────
async def create_stage(
    db: AsyncSession,
    circuit_id: int,
    payload: CircuitStageCreate,
    city_name: str | None = None,
) -> CircuitStage:
    """
    Inserta una etapa para un circuito y, opcionalmente, sus transportes.
    Propaga IntegrityError si (circuit_id, stage_order) duplica.
    """
    new_stage = CircuitStage(
        id_circuit=circuit_id,
        stage_order=payload.stage_order,
        city_id=payload.city_id,
        updated_by=payload.created_by,
        city_name=city_name,  # opcional
    )

    # Transportes opcionales
    if payload.transports:
        for t in payload.transports:
            new_stage.transports.append(_build_transport(t, payload.created_by))

    db.add(new_stage)
    try:
        db.commit()
        db.refresh(new_stage)
    except IntegrityError:
        db.rollback()
        raise

    return new_stage


# ────────────────────────────────────────────────────────────────
# READ
# ────────────────────────────────────────────────────────────────
async def get_stage(db: AsyncSession, stage_id: int) -> CircuitStage:
    stmt = select(CircuitStage).where(CircuitStage.id_stage == stage_id)
    result = db.execute(stmt)
    stage = result.scalar_one_or_none()
    if stage is None:
        raise NoResultFound
    return stage


async def list_stages(
    db: AsyncSession,
    circuit_id: int,
) -> Sequence[CircuitStage]:
    """
    Devuelve todas las etapas de un circuito, ordenadas por stage_order.
    """
    stmt = (
        select(CircuitStage)
        .options(
            selectinload(CircuitStage.city),          # city.name
            selectinload(CircuitStage.transports),    # avoids N+1
            )
        .where(CircuitStage.id_circuit == circuit_id)
        .order_by(CircuitStage.stage_order)
    )
    result = db.execute(stmt)
    return result.scalars().all()

# ────────────────────────────────────────────────────────────────
# UPDATE
# ────────────────────────────────────────────────────────────────
async def update_stage(
    db: AsyncSession,
    stage_id: int,
    payload: CircuitStageUpdate,
) -> CircuitStage:
    stage = await get_stage(db, stage_id)

    # Campos simples
    if payload.stage_order is not None:
        stage.stage_order = payload.stage_order
    if payload.city_id is not None:
        stage.city_id = payload.city_id
    stage.updated_by = payload.updated_by

    # Transportes: si viene lista ⇒ reemplazamos completamente
    if payload.transports is not None:
        stage.transports.clear()
        for t in payload.transports:
            stage.transports.append(_build_transport(t, payload.updated_by))

    try:
        db.commit()
        db.refresh(stage)
    except IntegrityError:
        db.rollback()
        raise

    return stage


# ────────────────────────────────────────────────────────────────
# DELETE
# ────────────────────────────────────────────────────────────────
async def delete_stage(db: AsyncSession, stage_id: int) -> None:
    stage = await get_stage(db, stage_id)  # Lanza 404 si no existe
    db.delete(stage)                       # cascada a transports por relación
    db.commit()







## VIEJO 


# async def get_circuit_stages(db:AsyncSession, id_circuit:str):
#     result = db.execute(select(CircuitStage).where(CircuitStage.id_circuit == id_circuit).order_by(CircuitStage.stage_order))
#     return result.scalars().all()



# async def get_stage_by_id(db: AsyncSession, stage_id: int) -> CircuitStage | None:
#     return db.get(CircuitStage, stage_id)

# async def get_stages_by_circuit(db: AsyncSession, circuit_id: int) -> list[CircuitStage]:
#     result = db.execute(
#         select(CircuitStage)
#         .where(CircuitStage.id_circuit == circuit_id)
#         .order_by(CircuitStage.stage_order)
#     )
#     return result.scalars().all()

# async def create_stage(db: AsyncSession, circuit_id: int, data: StageCreate) -> CircuitStage:
#     # Normalize or create city
#     city = await get_or_create_city(db, data.city_name, data.country)
#     new = CircuitStage(
#         id_circuit  = circuit_id,
#         city_id     = city.id,
#         stage_order = data.stage_order,
#         ferry       = data.ferry
#     )
#     db.add(new)
#     db.commit()
#     db.refresh(new)
#     return new

# async def update_stage(db: AsyncSession, stage_id: int, data: StageUpdate) -> CircuitStage | None:
#     stage = db.get(CircuitStage, stage_id)
#     if not stage:
#         return None
#     # Update city if provided
#     if data.city_name:
#         city = await get_or_create_city(db, data.city_name, data.country)
#         stage.city_id = city.id
#     # Update remaining fields
#     for field, value in data.dict(exclude_unset=True, exclude={"city_name","country"}).items():
#         setattr(stage, field, value)
#     db.commit()
#     db.refresh(stage)
#     return stage

# async def delete_stage(db: AsyncSession, stage_id: int) -> bool:
#     stage = db.get(CircuitStage, stage_id)
#     if not stage:
#         return False
#     db.delete(stage)
#     db.commit()
#     return True
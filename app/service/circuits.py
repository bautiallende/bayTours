from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from app.crud.circuit import (
    get_circuit_by_id, get_circuits,
    create_circuit as crud_create,
    update_circuit as crud_update,
    delete_circuit as crud_delete
)
from app.schemas.circuit import CircuitCreate, CircuitRead, CircuitUpdate

async def create(db: AsyncSession, data: CircuitCreate) -> CircuitRead:
    circuit = await crud_create(db, data)
    return CircuitRead.model_validate(circuit)

async def list(db: AsyncSession) -> List[CircuitRead]:
    circuits = await get_circuits(db)
    return [CircuitRead.model_validate(c) for c in circuits]

async def get(db: AsyncSession, circuit_id: int) -> CircuitRead | None:
    circuit = await get_circuit_by_id(db, circuit_id)
    return CircuitRead.model_validate(circuit) if circuit else None

async def update(db: AsyncSession, circuit_id: int, data: CircuitUpdate) -> CircuitRead | None:
    circuit = await crud_update(db, circuit_id, data)
    return CircuitRead.model_validate(circuit) if circuit else None

async def delete(db: AsyncSession, circuit_id: int) -> bool:
    return await crud_delete(db, circuit_id)
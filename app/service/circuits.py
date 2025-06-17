from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError, NoResultFound
from sqlalchemy.ext.asyncio import AsyncSession
from app.crud.circuit import (
    create_circuit as crud_create,
    get_circuit as crud_get,
    list_circuits as crud_list,
    update_circuit as crud_update,
    delete_circuit as crud_delete,
    get_circuit_id as get_circuit_id_crud,
)
from app.schemas.circuit import CircuitCreate, CircuitUpdate, CircuitRead


# ────────────────────────────────────────────────────────────────
# READ (single / list)
# ────────────────────────────────────────────────────────────────
async def get_circuit(db: AsyncSession, circuit_id: int) -> CircuitRead:
    try:
        circuit = await crud_get(db, circuit_id)
    except NoResultFound:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Circuit not found.")
    return CircuitRead.model_validate(circuit, from_attributes=True)


async def get_circuit_id(db:AsyncSession, name:str):
    result = await get_circuit_id_crud(db=db, name=name)
    return result


async def list_circuits(
    db: AsyncSession,
    skip: int = 0,
    limit: int = 100,
) -> list[CircuitRead]:
    circuits = await crud_list(db, skip=skip, limit=limit)
    return [CircuitRead.model_validate(c, from_attributes=True) for c in circuits]

# ────────────────────────────────────────────────────────────────
# CREATE
# ────────────────────────────────────────────────────────────────
async def create_circuit(db: AsyncSession, payload: CircuitCreate) -> CircuitRead:
    try:
        circuit = await crud_create(db, payload)
    except IntegrityError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Circuit name '{payload.name}' already exists.",
        )
    return CircuitRead.model_validate(circuit, from_attributes=True)



# ────────────────────────────────────────────────────────────────
# UPDATE
# ────────────────────────────────────────────────────────────────
async def update_circuit(
    db: AsyncSession,
    circuit_id: int,
    payload: CircuitUpdate,
) -> CircuitRead:
    try:
        circuit = await crud_update(db, circuit_id, payload)
    except NoResultFound:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Circuit not found.")
    except IntegrityError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Circuit name '{payload.name}' already exists.",
        )
    return CircuitRead.model_validate(circuit, from_attributes=True)



# ────────────────────────────────────────────────────────────────
# DELETE
# ────────────────────────────────────────────────────────────────
async def delete_circuit(db: AsyncSession, circuit_id: int) -> None:
    # Borrado idempotente: si el circuito no existe simplemente no pasa nada.
    await crud_delete(db, circuit_id)
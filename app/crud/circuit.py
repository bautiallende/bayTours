from sqlalchemy.ext.asyncio import AsyncSession
from typing import Sequence

from sqlalchemy import select, update, delete
from sqlalchemy.exc import IntegrityError, NoResultFound
from app.models.circuits import Circuit
from app.schemas.circuit import CircuitCreate, CircuitUpdate



# ────────────────────────────────────────────────────────────────
# READ
# ────────────────────────────────────────────────────────────────
async def get_circuit(db: AsyncSession, circuit_id: int) -> Circuit:
    stmt = select(Circuit).where(Circuit.id_circuit == circuit_id)
    result = db.execute(stmt)
    circuit = (await result).scalar_one_or_none()
    if circuit is None:
        raise NoResultFound
    return circuit

async def list_circuits(
    db: AsyncSession,
    *,
    skip: int = 0,
    limit: int = 100,
) -> Sequence[Circuit]:
    stmt = select(Circuit).offset(skip).limit(limit)
    result = db.execute(stmt)
    return (result).scalars().all()


async def get_circuit_id(db:AsyncSession, name:str):

    circuit = db.execute(select(Circuit).where(Circuit.name == name)) 
    circuit_data = circuit.scalars().one()

    print(f'circuit_data: {circuit_data.id}, {circuit_data.name}')
    
    return circuit_data 


# ────────────────────────────────────────────────────────────────
# CREATE
# ────────────────────────────────────────────────────────────────
async def create_circuit(db: AsyncSession, payload: CircuitCreate) -> Circuit:
    """
    Crea un circuito nuevo.  Deja que la UNIQUE(name) sea validada por la BD.
    """
    new_circuit = Circuit(
        name=payload.name,
        description=payload.description,
        total_nights=payload.total_nights,
        updated_by=payload.created_by,   # la primera vez coincide
    )
    db.add(new_circuit)
    try:
        db.commit()
        db.refresh(new_circuit)
    except IntegrityError:
        db.rollback()
        raise          # la capa service lo capturará y convertirá en HTTP 409

    return new_circuit


# ────────────────────────────────────────────────────────────────
# UPDATE
# ────────────────────────────────────────────────────────────────
async def update_circuit(
    db: AsyncSession,
    circuit_id: int,
    payload: CircuitUpdate,
) -> Circuit:
    values = payload.model_dump(exclude_unset=True)
    stmt = (
        update(Circuit)
        .where(Circuit.id_circuit == circuit_id)
        .values(**values)
        .execution_options(synchronize_session="fetch")
    )
    try:
        await db.execute(stmt)
        db.commit()
    except IntegrityError:
        db.rollback()
        raise

    return await get_circuit(db, circuit_id)

# ────────────────────────────────────────────────────────────────
# DELETE
# ────────────────────────────────────────────────────────────────
async def delete_circuit(db: AsyncSession, circuit_id: int) -> None:
    stmt = delete(Circuit).where(Circuit.id_circuit == circuit_id)
    await db.execute(stmt)
    db.commit()

    

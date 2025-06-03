from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.circuits import Circuits
from app.schemas.circuit import CircuitCreate, CircuitUpdate

async def get_circuit_by_id(db: AsyncSession, circuit_id: int) -> Circuits | None:
    return db.get(Circuits, circuit_id)

async def get_circuits(db: AsyncSession) -> list[Circuits]:
    result =  db.execute(select(Circuits).order_by(Circuits.id_circuit))
    return result.scalars().all()

async def create_circuit(db: AsyncSession, data: CircuitCreate) -> Circuits:
    new = Circuits(**data.dict())
    db.add(new)
    db.commit()
    db.refresh(new)
    return new

async def update_circuit(db: AsyncSession, circuit_id: int, data: CircuitUpdate) -> Circuits | None:
    circuit = db.get(Circuits, circuit_id)
    if not circuit:
        return None
    for field, value in data.dict(exclude_unset=True).items():
        setattr(circuit, field, value)
    db.commit()
    db.refresh(circuit)
    return circuit

async def delete_circuit(db: AsyncSession, circuit_id: int) -> bool:
    circuit = db.get(Circuits, circuit_id)
    if not circuit:
        return False
    db.delete(circuit)
    db.commit()
    return True



    

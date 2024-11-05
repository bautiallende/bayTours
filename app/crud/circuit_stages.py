from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.circuit_stages import CircuitStages



async def get_circuit_stages(db:AsyncSession, id_circuit:str):
    result = db.execute(select(CircuitStages).where(CircuitStages.id_circuit == id_circuit).order_by(CircuitStages.stage_order))
    return result.scalars().all()
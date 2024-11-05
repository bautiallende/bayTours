from sqlalchemy.ext.asyncio import AsyncSession
from app.crud import circuit_stages as circuit_stages_funtions



async def get_circuit_stage(db:AsyncSession, id_circuit:str):
    result = await circuit_stages_funtions.get_circuit_stages(db=db, id_circuit=id_circuit)
    return result

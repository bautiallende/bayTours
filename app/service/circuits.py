from sqlalchemy.ext.asyncio import AsyncSession
from app.crud import circuit as circuit_functions



async def get_circuit_id(db:AsyncSession, name:str):
    result = await circuit_functions.get_circuit_id(db=db, name=name)
    return result
from sqlalchemy.ext.asyncio import AsyncSession
from app.crud import operations as operations_functions



async def get_one(db:AsyncSession, id_operation:str):
    result = await operations_functions.get_one(db=db, id_operation=id_operation)
    return result

async def get_operations(db:AsyncSession):
    result = await operations_functions.get_operations(db=db)
    return result

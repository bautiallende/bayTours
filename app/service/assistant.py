from sqlalchemy.ext.asyncio import AsyncSession
from app.crud import assistant as assistant_funcions




async def get_all(db:AsyncSession):
    result = await assistant_funcions.get_all(db=db)
    return result


async def get_one(db:AsyncSession, id_assistant:str):
    result = await assistant_funcions.get_one(db=db, id_assistant=id_assistant)
    return result
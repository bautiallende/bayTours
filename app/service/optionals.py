from sqlalchemy.ext.asyncio import AsyncSession
from app.crud import optionals as optionals_functions



async def get_optionals(db: AsyncSession, id_stage:int, id_optional:int=None):
    response = await optionals_functions.get_optional(db=db, id_stage=id_stage, id_optional=id_optional)
    return response



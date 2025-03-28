from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.operations import Operations



async def get_operations(db:AsyncSession, active:bool= True):
    result = db.execute(select(Operations).where(Operations.active==active))
    operations = result.scalars().all()
    return operations


async def get_one(db:AsyncSession, id_operation:str):
    result = db.execute(select(Operations).where(Operations.id_operation==id_operation))
    operation = result.scalar_one_or_none()
    return operation
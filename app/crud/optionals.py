from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.optionals import Optionals


async def get_optional(db: AsyncSession, id_stage:int, id_optional:int=None):
    if not id_optional:
        result = db.execute(select(Optionals).where(Optionals.id_stage == id_stage))

    elif id_optional:
        result = db.execute(select(Optionals).where(Optionals.id_stage == id_stage and Optionals.id_optional == id_optional))
    
    optional = result.scalars().all()

    return optional
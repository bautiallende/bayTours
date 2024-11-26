from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.assistant import Assistant



async def get_all(db:AsyncSession):
    result = db.execute(select(Assistant).where(Assistant.active == True))
    assistants = result.scalars().all()
    return assistants



async def get_one(db:AsyncSession, id_assistant:str):
    result = db.execute(select(Assistant).where(Assistant.id_assistant == id_assistant))
    assistant = result.scalar_one_or_none()
    return assistant
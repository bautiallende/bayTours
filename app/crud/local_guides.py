from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import IntegrityError, NoResultFound
from sqlalchemy.future import select
from sqlalchemy import and_
from typing import List, Optional
from datetime import date
from app.models.local_guides import LocalGuides





async def get_all(city: str, db:AsyncSession):
    result = db.execute(select(LocalGuides).where(and_(LocalGuides.active == True, LocalGuides.city == city)))
    assistants = result.scalars().all()
    return assistants
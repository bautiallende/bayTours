from .base_handler import BaseHandler
from sqlalchemy.ext.asyncio import AsyncSession
from app.schemas.guides import GuideBase, Guide
from app.models.guides import Guides
from app.crud import guides as guides_functions


class GuidesHandler(BaseHandler):

    async def create(self, db: AsyncSession, guide_data:GuideBase):
        result = await guides_functions.create(db=db, guides_data=guide_data)
        return result
    

    async def update(self, db: AsyncSession, guide_data:Guide):
        result = await guides_functions.update(db=db, guide_data=guide_data)
        return result

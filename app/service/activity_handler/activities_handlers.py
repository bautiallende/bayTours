from .base_handler import BaseHandler
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import date
from app.models.activity import Activity
from app.crud import activity as activity_functions

class ActivityHandler(BaseHandler):
    async def create(self, db: AsyncSession, activity_data: Activity):
        result = await activity_functions.create(db=db, activity_data=activity_data)
        return result

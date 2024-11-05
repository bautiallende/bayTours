from sqlalchemy.ext.asyncio import AsyncSession
from .activity_handler import activity_handlers
from app.models.activity import Activity
from app.crud import activity as activity_functions



async def create(db:AsyncSession, activity_data: Activity):
    handler = activity_handlers.get('create')
    response = await handler(db=db, activity_data=activity_data)
    return response


async def get_by_group_id(db:AsyncSession, id_group:str, id_optional:int=None):
    request = await activity_functions.get_by_group_id(db=db, id_group=id_group, id_optional=id_optional)
    return request

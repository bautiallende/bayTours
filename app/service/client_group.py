from sqlalchemy.ext.asyncio import AsyncSession
from .clients_groups_handlers import client_group_handler
from app.models.client_group import ClientGroup


async def new_client_group(db:AsyncSession, client_id:str, id_group:str, packages:str, room_type:str, pax_number:int):
    handler = client_group_handler.get('new_client_group')
    response = await handler(db=db, client_id=client_id, id_group=id_group, packages=packages, room_type=room_type, pax_number=pax_number)
    return response


async def update_client_group(db:AsyncSession, data:ClientGroup):
    handler = client_group_handler.get('update_client_group')
    response = await handler(db=db, data=data)
    return response
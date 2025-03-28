from sqlalchemy.ext.asyncio import AsyncSession
from .clients_groups_handlers import client_group_handler



async def new_client_group(db:AsyncSession, client_id:str, id_group:str, packages:str, room_type:str):
    handler = client_group_handler.get('new_client_group')
    response = await handler(db=db, client_id=client_id, id_group=id_group, packages=packages, room_type=room_type)
    return response
from sqlalchemy.ext.asyncio import AsyncSession
from .client_room import clients_rooms_handler



async def create_client_room(db:AsyncSession, client_id:str, group_id:str):
    handler = clients_rooms_handler.get('new_room')
    result = await handler(db=db, client_id=client_id, group_id=group_id)
    return result
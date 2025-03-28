from sqlalchemy.ext.asyncio import AsyncSession
from .client_room import clients_rooms_handler
from app.schemas.clients_room import HotelRoomUpdate



async def create_client_room(db:AsyncSession, client_id:str, group_id:str):
    handler = clients_rooms_handler.get('new_room')
    result = await handler(db=db, client_id=client_id, group_id=group_id)
    return result


async def update_client_room(db:AsyncSession, client_room_data:HotelRoomUpdate):
    handler = clients_rooms_handler.get('update_room')
    result = await handler(db=db, client_room_data=client_room_data)
    return result
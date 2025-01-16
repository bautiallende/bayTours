from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import update
from sqlalchemy.future import select
from datetime import time
from app.models.clients_room import ClientsRoom


async def new_room(db:AsyncSession, client_room_data:ClientsRoom):
    db.add(client_room_data)
    db.commit()
    db.refresh(client_room_data)
    return client_room_data
from sqlalchemy.ext.asyncio import AsyncSession
from .base_handler import BaseHandler
from app.models.client_group import ClientGroup
from datetime import datetime
from uuid import uuid4
from app.crud import client_group as client_group_functions


class ClientGroupHandler(BaseHandler):
    
    async def create_client_group(self, db:AsyncSession, client_id:str, id_group:str, packages:str, room_type:str):
        group_data = ClientGroup(**{
            'id':str(uuid4()),
            'id_clients': client_id,
            'id_group': id_group,
            'registration_date': datetime.now(),
            'status':"New",
            'packages':packages,
            'room_type':room_type
        })

        await client_group_functions.create_group(db=db, group_data=group_data)
        print("message: Client group added successfully")
        return {"message": "Client group added successfully"}


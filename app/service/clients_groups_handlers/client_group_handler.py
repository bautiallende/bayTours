from sqlalchemy.ext.asyncio import AsyncSession
from .base_handler import BaseHandler
from app.models.client_group import ClientGroup
from datetime import datetime
from uuid import uuid4
from app.crud import client_group as client_group_functions


class ClientGroupHandler(BaseHandler):
    
    async def create_client_group(self, db:AsyncSession, client_id:str, id_group:str, packages:str, room_type:str, pax_number:int=None):
        group_data = ClientGroup(**{
            'id':str(uuid4()),
            'id_clients': client_id,
            'id_group': id_group,
            'registration_date': datetime.now(),
            'status':"New",
            'packages':packages,
            'room_type':room_type, 
            'pax_number':pax_number
        })

        await client_group_functions.create_group(db=db, group_data=group_data)
        print("message: Client group added successfully")
        return {"message": "Client group added successfully"}
    

    async def update_client_group(self, db:AsyncSession, data:ClientGroup):
        client_group_data = await client_group_functions.get_client_group_by_id_client(db=db, id_clients=data.id_clients)

        if not client_group_data:
            return {"message": "Client group not found"}
        
        if client_group_data.packages != data.packages and data.packages != None:
            client_group_data.packages = data.packages

            from app.service import group as group_service
            from app.service import clients as clients_service
            from app.service import optional_purchase as optional_purchase_service
    
            group_data = await group_service.get_group(db=db, id_group=client_group_data.id_group)
            if not group_data:
                return {"message": "Group not found"}
            
            client_data = await clients_service.get_client_by_id(db=db, id_client=data.id_clients)
            if not client_data:
                return {"message": "Client not found"}
            
            age =  datetime.now().year - client_data.birth_date.year

            new_optional = await optional_purchase_service.create_optional_purchase(
                db=db, 
                group_number=client_group_data.id_group, 
                id_clientes=data.id_clients, 
                packages=data.packages, 
                age=age, 
                id_circuit=group_data.circuit
            )
        
        client_group_data.packages = data.packages
        client_group_data.room_type = data.room_type
        client_group_data.shown = data.shown

        
        new_group = await client_group_functions.update_group(db=db, group_data=client_group_data)




            

            


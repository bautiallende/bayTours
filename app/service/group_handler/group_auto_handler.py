from sqlalchemy.ext.asyncio import AsyncSession
import pandas as pd
from datetime import datetime

from .base_handler import GroupHandler
from app.schemas.group import GroupCreate
from app.crud import group as group_functions
from app.service import days as days_services
from app.service import transport as transport_services


class GroupsAutoHandler(GroupHandler):
    async def create(self, db:AsyncSession, new_group: GroupCreate):
        print(new_group)
        group_data = await group_functions.get_group(db, new_group.id_group)

        if group_data:
            return {"message": "El grupo ya existe"}
        
        # TODO: aca tenemos que crear la fila del transporte 
        transport_line = await transport_services.create(db, 'AutoHandler')

        new_group.id_transport = transport_line.id_transport

        group_data = await super().create(db, new_group)
        
        print(f'start date: {group_data.start_date}')
        print(f'end date: {group_data.end_date}')
        
        if group_data.start_date and group_data.end_date:
            result = await days_services.new_group(db=db, id_group=group_data.id_group, arrival_date=group_data.start_date, departure_date=group_data.end_date, id_circuit=group_data.circuit)
            
        return
        

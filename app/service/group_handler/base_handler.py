from sqlalchemy.ext.asyncio import AsyncSession
from app.schemas.group import GroupCreate, Status
from app.crud import group as group_functions 
from app.models.group import Group

class GroupHandler:

    async def create(self, db:AsyncSession, new_group: GroupCreate):

        group = Group(
            id_group=new_group.id_group,
            id_transport = new_group.id_transport,
            status=Status.new,
            start_date=new_group.start_date,
            end_date=new_group.end_date,
            initial_flight=new_group.initial_flight,
            end_flight=new_group.end_flight,
            PAX=new_group.PAX,
            circuit=new_group.circuit,
        )
        
        result = await group_functions.create_group(db=db, group_data=group)

        return result

            
        
    def __init__(self):
        pass
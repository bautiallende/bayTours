from sqlalchemy.ext.asyncio import AsyncSession
from app.models.rooms_composition import RoomsComposition
from app.crud import room_composition as room_composition_function 


class BaseHandler:
    def __init__(self):
        pass


    async def create(self, db: AsyncSession, room_data: RoomsComposition):
        """
        Crea una nueva composición de habitación en la base de datos.
        """
        result = await room_composition_function.create(db=db, room_data=room_data)
        return result


        

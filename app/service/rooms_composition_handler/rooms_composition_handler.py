from sqlalchemy.ext.asyncio import AsyncSession
from .base_handler import BaseHandler
from app.models.rooms_composition import RoomsComposition


class RoomsCompositionHandler(BaseHandler):

    async def create(self, db: AsyncSession, room_data:RoomsComposition):
        """
        Crea una nueva composición de habitación en la base de datos.
        """
        
        new_room = await super().create(db=db, room_data=room_data)
        return new_room
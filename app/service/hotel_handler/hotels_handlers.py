from sqlalchemy.ext.asyncio import AsyncSession
from .base_handler import BaseHandler
from app.schemas.hotels import BaseModel
from app.models.hotel import Hotel



class HotelsHandler(BaseHandler):

    async def create(self, db:AsyncSession, hotel_data:BaseModel):
        new_hotel = Hotel(**hotel_data.dict())
        db.add(new_hotel)
        db.commit()
        return new_hotel
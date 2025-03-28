from sqlalchemy import Column, Integer, String, DateTime, Boolean, FLOAT
from ..database import Base

class HotelsRooms(Base):
    __tablename__ = "hotels_rooms"

    id_room = Column(Integer, primary_key=True, index=True)
    id_hotel = Column(Integer)
    type = Column(String(255))
    price = Column(FLOAT)
    currency = Column(String(255))
    
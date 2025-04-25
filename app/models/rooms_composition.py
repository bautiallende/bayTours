from sqlalchemy import Column, Integer, String, DateTime, Time, Float, Boolean, TEXT
from ..database import Base


class RoomsComposition(Base):
    __tablename__ = "rooms_composition"

    id = Column(String(255), primary_key=True)
    id_room = Column(Integer)
    room_number = Column(String(255))
    room_type = Column(String(255))
    check_in_date = Column(DateTime)
    departure_date = Column(DateTime)
    price = Column(Float)
    currency = Column(String(255))
    room_type = Column(String(255))
    complement = Column(Float)
    complement_currency = Column(String(255))
    status = Column(String(255))
    comments = Column(TEXT)
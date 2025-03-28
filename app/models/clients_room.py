from sqlalchemy import Column, Integer, String, Date, DateTime, Float, TEXT
from ..database import Base


class ClientsRoom(Base):
    __tablename__ = "clients_room"

    id = Column(String(255), primary_key=True)
    id_days = Column(String(255))
    id_hotel_reservation = Column(String(255))
    client_id = Column(String(255))
    id_room = Column(Integer)
    room_number = Column(String(255))
    check_in_date = Column(DateTime)
    departure_date = Column(DateTime)
    price = Column(Float)
    currency = Column(String(255))
    complement = Column(Float)
    complement_currency = Column(String(255))
    status = Column(String(255))
    comments = Column(TEXT)
    
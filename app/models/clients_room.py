from sqlalchemy import Column, Integer, String, Date, DateTime, Float, TEXT
from ..database import Base


class ClientsRoom(Base):
    __tablename__ = "clients_room"

    id = Column(String(255), primary_key=True)
    id_days = Column(String(255))
    room_composition_id = Column(String(255))
    client_id = Column(String(255))
    status = Column(String(255))
    comments = Column(TEXT)
    
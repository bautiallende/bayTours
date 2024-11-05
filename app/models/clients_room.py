from sqlalchemy import Column, Integer, String, Date, DateTime
from ..database import Base


class ClientsRoom(Base):
    __tablename__ = "clients_room"

    id = Column(Integer, primary_key=True)
    client_id = Column(String(255))
    id_room = Column(Integer)
    entry_date = Column(DateTime)
    departure_date = Column(DateTime)
    id_group = Column(String(255))
    id_hotel = Column(Integer)
    comments = Column(String(255))
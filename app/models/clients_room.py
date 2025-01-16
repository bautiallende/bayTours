from sqlalchemy import Column, Integer, String, Date, DateTime
from ..database import Base


class ClientsRoom(Base):
    __tablename__ = "clients_room"

    id = Column(Integer, primary_key=True)
    id_hotel_reservation = Column(String(255))
    id_clients = Column(String(255))
    id_room = Column(Integer)
    check_in_date = Column(DateTime)
    check_out_date = Column(DateTime)
    status = Column(String(255))
    comments = Column(String(255))
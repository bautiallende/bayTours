from sqlalchemy import Column, Integer, String, Date, DateTime, Boolean
from ..database import Base


class ClientGroup(Base):
    __tablename__ = "client_group"

    id = Column(String(255), primary_key=True, index=True)
    id_clients = Column(String(255))
    id_group = Column(String(255))
    registration_date = Column(DateTime)
    status = Column(String(255))
    packages = Column(String(255))
    room_type = Column(String(255))
    shown = Column(Boolean, default=True)
    pax_number = Column(Integer)
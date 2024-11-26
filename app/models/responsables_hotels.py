from sqlalchemy import Column, Integer, String, DateTime, Time, Float, Boolean
from ..database import Base


class ResponsablesHotels(Base):
    __tablename__ = "responsables_hotels"

    id_responsible_hotels = Column(Integer, primary_key=True)
    name = Column(String(255))
    surname = Column(String(255))
    phone = Column(String(255))
    mail = Column(String(255))
    active = Column(Boolean)
    comments = Column(String(255))

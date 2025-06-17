from sqlalchemy import Column, Integer, String, Date, DateTime, Boolean
from ..database import Base

class Drivers(Base):
    __tablename__ = "drivers"

    id_driver = Column(Integer, primary_key=True)
    name = Column(String(255))
    surname = Column(String(255))
    phone = Column(String(255))
    mail = Column(String(255))
    active = Column(Boolean)
    circuit = Column(String(255))
    comments = Column(String(255))
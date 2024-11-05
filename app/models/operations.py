from sqlalchemy import Column, Integer, String, DateTime, Time, Float, Boolean
from ..database import Base

class Operations(Base):
    __tablename__ = "operations"

    id_operation = Column(Integer, primary_key=True)
    name = Column(String(255))
    surname = Column(String(255))
    phone = Column(String(255))
    mail = Column(String(255))
    active = Column(Boolean)
    comment = Column(String(255))
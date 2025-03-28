from sqlalchemy import Column, Integer, String, DateTime, Boolean, Date
from ..database import Base

class Guides(Base):
    __tablename__ = "guides"

    id_guide  = Column(Integer, primary_key=True)
    name = Column(String(255))
    surname = Column(String(255))
    phone = Column(String(255))
    birth_date = Column(Date)
    mail = Column(String(255))
    passaport = Column(String(255))
    active = Column(Boolean)
    comment = Column(String(255))
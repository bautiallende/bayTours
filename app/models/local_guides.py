from sqlalchemy import Column, Integer, String, DateTime, Boolean, FLOAT
from ..database import Base

class LocalGuides(Base):
    __tablename__ = "local_guides"

    id_local_guide = Column(Integer, primary_key=True, index=True)
    name = Column(String(255))
    surname = Column(String(255))
    phone = Column(String(255))
    mail = Column(String(255))
    active = Column(Boolean, default=True)
    comments = Column(String(255))
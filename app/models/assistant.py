from sqlalchemy import Column, Integer, String, DateTime, Time, Float, Boolean
from ..database import Base

class Assistant(Base):
    __tablename__ = "assistant"

    id_assistant = Column(Integer, primary_key=True, index=True)
    name = Column(String(255))
    surname = Column(String(255))
    phone = Column(String(255))
    mail = Column(String(255))
    active = Column(Boolean)
    comments = Column(String(255))
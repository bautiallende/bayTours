from sqlalchemy import Column, Integer, String, Date, DateTime, Boolean
from ..database import Base

class Days(Base):
    __tablename__ = "days"

    id = Column(String(255), primary_key=True)
    id_group = Column(String(255))
    day = Column(Integer)
    date = Column(Date)
    city = Column(String(255))
    ferry = Column(Boolean)
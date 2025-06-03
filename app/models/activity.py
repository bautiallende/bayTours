from sqlalchemy import Column, Integer, String, Date, DateTime, Time, Boolean
from ..database import Base

class Activity(Base):
    __tablename__ = "activity"

    id = Column(String(255), primary_key=True)
    id_days = Column(String(255))
    date = Column(Date)
    time = Column(Time)
    duration = Column(Time)
    id_optional = Column(Integer)
    id_local_guide = Column(Integer)
    comment = Column(String(255))
    PAX = Column(Integer)

from sqlalchemy import Column, Integer, String, Date, DateTime, Time, Boolean
from ..database import Base

class Ferry(Base):
    __tablename__ = "ferry"

    ferry_id=  Column(Integer, primary_key=True)
    id_days = Column(String(255))
    departure_time =  Column(DateTime)
    arrival_time = Column(DateTime)
    company = Column(String(255))
    reservation_number = Column(String(255))
    status = Column(String(255))
    ferry = Column(Boolean)
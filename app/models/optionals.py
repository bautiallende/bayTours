from sqlalchemy import Column, Integer, String, DateTime, Time, Float
from ..database import Base

class Optionals(Base):
    __tablename__ = "optionals"
    
    id_optional = Column(Integer, primary_key=True, index=True)
    id_stage = Column(Integer)
    name = Column(String(255))
    activity_time = Column(Time)
    adult_price = Column(Float)
    minor_price = Column(Float)
    min_pax = Column(Integer)
    max_pax = Column(Integer)
    city = Column(String(255))
    update_datetime = Column(DateTime)
    update_user_id = Column(String(255))


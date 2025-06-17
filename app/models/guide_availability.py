from sqlalchemy import Column, Integer, String, DateTime, Boolean, Date
from ..database import Base

class GuideAvailability(Base):
    __tablename__ = "guide_availability"

    id = Column(Integer, primary_key=True)
    id_guide = Column(Integer)
    start_date = Column(Date)
    end_date = Column(Date)
    id_group = Column(String(255))
    reason = Column(String(255))
    
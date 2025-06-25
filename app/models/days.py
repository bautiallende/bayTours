from sqlalchemy import Column, Integer, String, Date, DateTime, Boolean
from sqlalchemy.orm import relationship
from ..database import Base

class Days(Base):
    __tablename__ = "days"

    id = Column(String(255), primary_key=True)
    id_group = Column(String(255))
    day = Column(Integer)
    date = Column(Date)
    city = Column(String(255))
    ferry = Column(Boolean)

    transports = relationship(
        "DayTransport",
        back_populates="day",
        cascade="all, delete-orphan",
        lazy="selectin",
    )
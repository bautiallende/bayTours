from datetime import date, datetime
from sqlalchemy import (
    Column, Integer, Date, Enum, String,
    ForeignKey, DateTime, Text
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database import Base


class GuideAvailability(Base):
    __tablename__ = "guide_availability"

    id_availability = Column(Integer, primary_key=True, autoincrement=True)
    id_guide        = Column(Integer, ForeignKey("guides.id_guide"), nullable=False)

    start_date      = Column(Date, nullable=False)
    end_date        = Column(Date, nullable=False)

    status          = Column(
        Enum("free", "tentative", "confirmed", "unavailable", "vacation", name="availability_status_enum"),
        default="free",
        nullable=False,
    )
    id_group        = Column(String(255), ForeignKey("group.id_group"), nullable=True)
    notes           = Column(Text)

    modified_at     = Column(DateTime, server_default=func.now(), onupdate=func.now())
    modified_by     = Column(String(255))

    guide = relationship("Guides", back_populates="availability")
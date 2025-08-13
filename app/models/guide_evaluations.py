from datetime import datetime
from sqlalchemy import (
    Column, Integer, SmallInteger, Text,
    Enum, String, DateTime, ForeignKey
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database import Base


class GuideEvaluation(Base):
    __tablename__ = "guide_evaluations"

    id_eval   = Column(Integer, primary_key=True)
    id_guide  = Column(Integer, ForeignKey("guides.id_guide"), nullable=False)
    id_group  = Column(String(255), ForeignKey("group.id_group"), nullable=True)

    source    = Column(Enum("ops", "assistant", "client", name="evaluation_source_enum"))
    rating    = Column(SmallInteger)               # 1-5
    comment   = Column(Text)

    created_at = Column(DateTime, server_default=func.now())
    created_by = Column(String(255))

    guide = relationship("Guides", back_populates="evaluations")
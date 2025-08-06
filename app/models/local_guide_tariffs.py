from sqlalchemy import Column, Integer, String, DateTime, Boolean, Float, func, ForeignKey, Enum, CHAR, Date
from ..database import Base
from sqlalchemy.orm import Mapped, mapped_column, relationship


class LocalGuideTariff(Base):
    __tablename__ = "local_guide_tariffs"

    id_tariff       = Column(Integer, primary_key=True)
    id_local_guide  = Column(Integer, ForeignKey("local_guides.id_local_guide"), nullable=False)
    id_optional     = Column(Integer, ForeignKey("optionals.id_optional"), nullable=True)  # NULL = catch-all
    pax_min         = Column(Integer, default=1)
    pax_max         = Column(Integer, nullable=True)              # NULL = sin tope
    day_type        = Column(Enum("any", "weekday", "weekend", "holiday"), default="any")
    price           = Column(Float, nullable=False)
    currency        = Column(CHAR(3), default="EUR")
    valid_from      = Column(Date, nullable=True)
    valid_to        = Column(Date, nullable=True)
    notes           = Column(String(255))

    created_at      = Column(DateTime, server_default=func.now())
    updated_at      = Column(DateTime, server_default=func.now(), onupdate=func.now())
    updated_by      = Column(String(255))

    guide     = relationship("LocalGuides", back_populates="tariffs")
    optional  = relationship("Optionals", lazy="joined")          # opcional
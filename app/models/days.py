from sqlalchemy import Column, Integer, String, Date, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from ..database import Base

class Days(Base):
    __tablename__ = "days"

    id        = Column(String(255), primary_key=True)
    id_group  = Column(String(255), index=True)

    # --- NUEVO ---
    id_city   = Column(Integer, ForeignKey("cities.id"), index=True, nullable=False)

    day       = Column(Integer)
    date      = Column(Date)
    ferry     = Column(Boolean)

    # relación para acceder al nombre de la ciudad si el front lo necesita
    transports = relationship(
        "DayTransport",
        back_populates="day",
        cascade="all, delete-orphan",
        lazy="selectin",
    )

    city_rel = relationship("City", lazy="joined")

    @property
    def city(self) -> str:        
        return self.city_rel.name

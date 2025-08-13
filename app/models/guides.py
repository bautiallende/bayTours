from datetime import datetime, date
from sqlalchemy import (
    Column, Integer, String, Boolean, Float, Date, DateTime,
    Enum, ForeignKey, JSON, CHAR
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database import Base


class Guides(Base):
    __tablename__ = "guides"

    id_guide        = Column(Integer, primary_key=True, index=True)

    # Datos personales
    name            = Column(String(255))
    surname         = Column(String(255))
    phone           = Column(String(255))
    mail            = Column(String(255))
    photo_url       = Column(String(255))
    birth_date     = Column(Date)

    # Localización
    id_city         = Column(Integer, ForeignKey("cities.id"), nullable=False, index=True)
    nationality     = Column(String(100))
    languages       = Column(JSON)                       # ["es","en","de"]

    # Documentos
    passport_number = Column(String(50))
    passport_expiry = Column(Date)
    license_number  = Column(String(50))
    license_expiry  = Column(Date, nullable=True)

    # Contrato y tarifas
    contract_type        = Column(Enum("staff", "third_party", name="guide_contract_enum"), default="third_party")
    daily_rate           = Column(Float, nullable=False)
    currency             = Column(CHAR(3), default="EUR")
    commission_onsite    = Column(Float, default=0)       # %
    commission_pretour   = Column(Float, default=0)       # %

    comment        = Column(String(255))
    active          = Column(Boolean, default=True)

    created_at      = Column(DateTime, server_default=func.now())
    updated_at      = Column(DateTime, server_default=func.now(), onupdate=func.now())
    updated_by      = Column(String(255))

    # Relaciones
    availability    = relationship(
        "GuideAvailability", back_populates="guide", cascade="all, delete-orphan"
    )
    evaluations     = relationship(
        "GuideEvaluation", back_populates="guide", cascade="all, delete-orphan"
    )

    city = relationship("City", lazy="joined")

    @property
    def city_name(self) -> str | None:
        return self.city.name if getattr(self, "city", None) else None
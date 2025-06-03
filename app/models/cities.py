from datetime import datetime

from sqlalchemy import (
    CHAR,
    String,
    Boolean,
    Float,
    Integer,
    UniqueConstraint,
    DateTime,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column

from ..database import Base


class City(Base):
    """Canonical registry of cities used across the CRM.

    The table is enriched with geographic and business‑specific metadata so that
    other modules (circuits, logistics, permits, reports) can query cities by
    multiple criteria (continent, region, special permits, etc.).
    """

    __tablename__ = "cities"
    __table_args__ = (
        # Primary unique key when geonames_id is known.
        UniqueConstraint("geonames_id", name="uq_city_geonames"),
        # Fallback uniqueness guard when geonames_id is not provided.
        UniqueConstraint(
            "name",
            "country",
            "region",
            name="uq_city_name_country_region",
        ),
    )

    # --- Identifiers -------------------------------------------------------
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    geonames_id: Mapped[int | None] = mapped_column(Integer, unique=True)

    # --- Descriptive fields ------------------------------------------------
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    country: Mapped[str | None] = mapped_column(CHAR(2))  # ISO‑3166‑1 alpha‑2
    region: Mapped[str | None] = mapped_column(String(100))
    continent: Mapped[str | None] = mapped_column(CHAR(2))  # ISO‑3166‑1 continent codes (EU, NA, AS…)

    # --- Geospatial metadata ----------------------------------------------
    latitude: Mapped[float | None] = mapped_column(Float)
    longitude: Mapped[float | None] = mapped_column(Float)

    # --- Business flags ----------------------------------------------------
    needs_bus_permit: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    # --- Audit -------------------------------------------------------------
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
    updated_by: Mapped[str | None] = mapped_column(String(250))

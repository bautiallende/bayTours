from datetime import datetime

from sqlalchemy import (
    String,
    Integer,
    UniqueConstraint,
    DateTime,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..database import Base


class Circuit(Base):
    """Product‑level definition of a tour circuit (itinerary blueprint).

    * `total_nights` refleja la duración **base** publicada; un grupo concreto
      puede luego extender esa duración según vuelos, pero el blueprint se
      mantiene aquí.
    * Timestamps y `updated_by` nos dan trazabilidad completa.
    """

    __tablename__ = "circuits"
    __table_args__ = (UniqueConstraint("name", name="uq_circuit_name"),)

    id: Mapped[int] = mapped_column("id_circuit", Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(String(255))
    total_nights: Mapped[int] = mapped_column(Integer, nullable=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), onupdate=func.now(), server_default=func.now()
    )
    updated_by: Mapped[str | None] = mapped_column(String(250))

    # --- Relationships -----------------------------------------------------
    stages: Mapped[list["CircuitStage"]] = relationship(
        back_populates="circuit", cascade="all, delete-orphan"
    )

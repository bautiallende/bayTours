from datetime import datetime

from sqlalchemy import (
    Integer,
    String,
    ForeignKey,
    UniqueConstraint,
    DateTime,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..database import Base


class CircuitStage(Base):
    """Defines one day / stop inside a **Circuit** blueprint.

    * No información de transporte aquí; eso vive en la tabla `stage_transports`.
    * Una etapa queda unívocamente identificada por `(id_circuit, stage_order)`.
    """

    __tablename__ = "circuit_stages"
    __table_args__ = (
        UniqueConstraint("id_circuit", "stage_order", name="uq_stage_order"),
    )

    id_stage: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)

    # ─────────────────────────────────────────────────────────── Relaciones ──
    id_circuit: Mapped[int] = mapped_column(
        ForeignKey("circuits.id_circuit", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    city_id: Mapped[int] = mapped_column(
        ForeignKey("cities.id"),
        nullable=False,
        index=True,
    )

    stage_order: Mapped[int] = mapped_column(Integer, nullable=False)

    # ─────────────────────────────────────────────── Metadatos de auditoría ──
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
    updated_by: Mapped[str | None] = mapped_column(String(250))

    # ──────────────────────────────────────────────────────── ORM helpers ──
    circuit = relationship("Circuit", back_populates="stages")
    city = relationship("City")
    transports = relationship(
        "StageTransport", back_populates="stage", cascade="all, delete-orphan"
    )

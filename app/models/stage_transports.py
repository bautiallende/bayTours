"""Transport segments attached to a CircuitStage.

Solo se crea un registro cuando la etapa usa **un medio extra o específico** que
necesita ser gestionado (ferry, vuelo, tren, etc.). El bus regular que acompaña
al grupo por defecto *no* se almacena aquí, evitando ruido en la tabla.
"""

from datetime import datetime, time
from sqlalchemy import Time

from sqlalchemy import (
    Enum,
    Integer,
    String,
    ForeignKey,
    DateTime,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..database import Base


class StageTransport(Base):
    __tablename__ = "stage_transports"

    id_transport: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)

    # FK to the stage where this transport is used
    id_stage: Mapped[int] = mapped_column(
        ForeignKey("circuit_stages.id_stage", ondelete="CASCADE"), nullable=False
    )

    # Main transport mode; extendable without schema change by altering Enum if needed
    mode: Mapped[str] = mapped_column(
        Enum(
            "bus",  # refuerzo (ej. tramo local distinto al bus base)
            "ferry",
            "train",
            "flight",
            "boat",
            "walk",
            "other",
            "gondola",
            name="transport_mode_enum",
        ),
        nullable=False,
    )

    # Optional descriptive fields
    operator_name: Mapped[str | None] = mapped_column(String(255))
    transport_code: Mapped[str | None] = mapped_column(String(100))  # nº de vuelo, ferry, etc.
    depart_time: Mapped[time | None] = mapped_column(Time(), nullable=True)
    notes: Mapped[str | None] = mapped_column(String(500))

    # Metadata
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), onupdate=func.now(), server_default=func.now()
    )
    updated_by: Mapped[str | None] = mapped_column(String(250))

    # ORM relationships
    stage: Mapped["CircuitStage"] = relationship(
        back_populates="transports", lazy="joined"
    )

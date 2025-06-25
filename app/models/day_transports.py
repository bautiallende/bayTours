from datetime import datetime

from sqlalchemy import (
    Column,
    DateTime,
    Enum,
    ForeignKey,
    Integer,
    String,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..database import Base


class DayTransport(Base):
    """
    Transporte real asociado a un día de un grupo.
    Equivale a una 'instancia' del StageTransport plantilla.
    """

    __tablename__ = "day_transports"

    id_transport: Mapped[int] = mapped_column(
        primary_key=True, autoincrement=True
    )

    # ──────────── Relaciones ────────────────────────────────────
    id_day: Mapped[str] = mapped_column(
        ForeignKey("days.id", ondelete="CASCADE"), index=True
    )

    mode: Mapped[str] = mapped_column(
        Enum(
            "bus",
            "ferry",
            "train",
            "flight",
            "boat",
            "walk",
            "gondola",
            "other",
            name="transport_mode_enum",
        ),
        nullable=False,
    )

    operator_name: Mapped[str | None] = mapped_column(String(100))
    reference_code: Mapped[str | None] = mapped_column(String(50))
    departure_time: Mapped[datetime | None] = mapped_column(DateTime)
    notes: Mapped[str | None] = mapped_column(String(255))

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
    updated_by: Mapped[str | None] = mapped_column(String(250))

    # (opcional) relación inversa
    day = relationship("Days", back_populates="transports", lazy="joined")
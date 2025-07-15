from datetime import datetime, date, time

from sqlalchemy import (
    Column,
    Date,
    DateTime,
    Enum,
    ForeignKey,
    Integer,
    String,
    Time,
    UniqueConstraint,
    func,
    Boolean,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..database import Base


class Activity(Base):
    """Actividad opcional asociada a un día de un grupo."""

    __tablename__ = "activity"

    # PK
    id: Mapped[str] = mapped_column(String(255), primary_key=True)

    # FKs
    id_days: Mapped[str] = mapped_column(
        ForeignKey("days.id", ondelete="CASCADE"), index=True, nullable=False
    )
    id_optional: Mapped[int] = mapped_column(   
        ForeignKey("optionals.id_optional", ondelete="CASCADE"), index=True, nullable=False
    )
    id_local_guide: Mapped[int | None] = mapped_column(
        ForeignKey("local_guides.id_local_guide"), index=True
    )

    # Datos principales
    date: Mapped[date] = mapped_column(Date, nullable=False)
    time: Mapped[time | None] = mapped_column(Time, nullable=True)
    duration: Mapped[int | None] = mapped_column(Integer)  # horas
    PAX: Mapped[int | None] = mapped_column(Integer)
    reservation_n: Mapped[str | None] = mapped_column(String(255))
    comment: Mapped[str | None] = mapped_column(String(500))

    status_optional: Mapped[str] = mapped_column(
        Enum(
            "pending",
            "confirmed",
            "cancelled",
            name="status_optional_enum",
        ),
        default="pending",
        nullable=False,
    )

    # Auditoría
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
    updated_by: Mapped[str | None] = mapped_column(String(255))

    # Relaciones ORM
    day = relationship("Days", lazy="joined")
    optional = relationship("Optionals", lazy="joined")
    local_guide = relationship("LocalGuides", lazy="joined")
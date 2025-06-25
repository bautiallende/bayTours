from datetime import datetime, date

from sqlalchemy import (
    Column,
    Date,
    DateTime,
    Enum,
    Float,
    ForeignKey,
    String,
    TEXT,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..database import Base


class GroupCityPermit(Base):
    """
    Un permiso de bus que cubre la estancia de un *grupo* en una *ciudad*
    (uno por ciudad y grupo, aunque abarque varios días consecutivos).
    """

    __tablename__ = "group_city_permits"
    __table_args__ = (
        UniqueConstraint(
            "id_group",
            "id_city",
            name="uq_group_city_permit",
        ),
    )

    # ──────────── Clave primaria ─────────────────────────────────
    id_permit: Mapped[str] = mapped_column(String(255), primary_key=True)

    # ──────────── Relaciones ────────────────────────────────────
    id_group: Mapped[str] = mapped_column(
        ForeignKey("group.id_group", ondelete="CASCADE"), index=True
    )
    id_city: Mapped[int] = mapped_column(
        ForeignKey("cities.id"), index=True, nullable=False
    )
    id_transport: Mapped[str] = mapped_column(
        ForeignKey("transport.id_transport"), index=True, nullable=False
    )

    # ──────────── Vigencia ──────────────────────────────────────
    valid_from: Mapped[date] = mapped_column(Date, nullable=False)
    valid_to:   Mapped[date] = mapped_column(Date, nullable=False)

    status: Mapped[str] = mapped_column(
        Enum(
            "pending",
            "submitted",
            "approved",
            "rejected",
            name="permit_status_enum",
        ),
        default="pending",
        nullable=False,
    )

    # ──────────── Datos operativos (pueden quedar nulos al inicio) ──────────
    permit_number: Mapped[str | None] = mapped_column(String(255))
    managed_by:    Mapped[str | None] = mapped_column(String(255))
    provider:      Mapped[str | None] = mapped_column(String(255))
    price:         Mapped[float | None] = mapped_column(Float)
    payed_with:    Mapped[str | None] = mapped_column(String(255))
    payment_date:  Mapped[date | None] = mapped_column(Date)
    comments:      Mapped[str | None] = mapped_column(TEXT)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
    updated_by: Mapped[str | None] = mapped_column(String(255))

    # ──────────── Relaciones ORM (opcionales) ──────────────────
    group     = relationship("Group",     lazy="joined")
    city      = relationship("City",      lazy="joined")
    transport = relationship("Transport", lazy="joined")
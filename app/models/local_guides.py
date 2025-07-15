from sqlalchemy import Column, Integer, String, DateTime, Boolean, FLOAT, func, ForeignKey
from ..database import Base
from sqlalchemy.orm import Mapped, mapped_column, relationship

class LocalGuides(Base):
    __tablename__ = "local_guides"

    id_local_guide = Column(Integer, primary_key=True, index=True)
    name = Column(String(255))
    surname = Column(String(255))
    phone = Column(String(255))
    mail = Column(String(255))
    city = mapped_column(
        ForeignKey("cities.id", ondelete="CASCADE"), nullable=False
    )
    active = Column(Boolean, default=True)
    comments = Column(String(255))
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    updated_by = Column(String(255), nullable=True)


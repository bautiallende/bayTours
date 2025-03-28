from sqlalchemy import Column, Integer, String, Date, DateTime, Boolean
from ..database import Base


class CircuitStages(Base):
    __tablename__ = "circuit_stages"

    id_stage = Column(Integer, primary_key=True, nullable=False)
    id_circuit = Column(Integer)
    city_name = Column(String(255))
    stage_order = Column(Integer)
    ferry = Column(Boolean)
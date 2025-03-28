from sqlalchemy import Column, Integer, String, DateTime, Time, Float
from ..database import Base

class Packages(Base):
    __tablename__ = "packages"

    id_packages = Column(Integer, primary_key=True)
    id_circuit = Column(Integer)
    id_stage = Column(Integer)
    id_optional = Column(Integer)
    package_number = Column(Integer)

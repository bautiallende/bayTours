"""Pydantic schemas for City resources — **v2** style.

* **Input (CityCreate / CityUpdate)**: recibimos solo los campos que viene
  del front. La enriquecimiento (region, continent, lat/lon) lo calculamos en
  la capa de servicio usando `geonamescache` y `rapidfuzz`.  
* **Output (CityRead)**: devolvemos todos los campos, incluidos los
  enriquecidos.
"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field

# ---------------------------------------------------------------------------
# Base definitions
# ---------------------------------------------------------------------------

class CityBase(BaseModel):
    """Campos mínimos que identifican de forma unívoca una ciudad."""

    name: str = Field(..., max_length=255, description="Nombre oficial de la ciudad")
    country: str = Field(
        ..., min_length=2, max_length=2, description="Código ISO‑3166‑1 alfa‑2"
    )
    needs_bus_permit: bool = Field(False, description="¿Requiere permiso especial de autobús?")
    geonames_id: Optional[int] = Field(
        None, description="Identificador GeoNames si ya se conoce"
    )


# ---------------------------------------------------------------------------
# Input Schemas
# ---------------------------------------------------------------------------

class CityCreate(CityBase):
    """Payload para crear una ciudad.  
    Los campos geo se rellenarán en el servicio.
    """

    created_by: str = Field(..., max_length=250, description="Usuario creador")


class CityUpdate(BaseModel):
    """Payload para actualizar (parcialmente) una ciudad."""

    name: Optional[str] = Field(None, max_length=255)
    country: Optional[str] = Field(None, min_length=2, max_length=2)
    needs_bus_permit: Optional[bool] = None
    geonames_id: Optional[int] = None
    updated_by: str = Field(..., max_length=250, description="Usuario que actualiza")


# ---------------------------------------------------------------------------
# Output Schema
# ---------------------------------------------------------------------------

class CityRead(CityBase):
    """Respuesta completa incluyendo metadatos y enriquecimiento."""

    id: int
    region: Optional[str] = None
    continent: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    created_at: datetime
    updated_at: datetime
    updated_by: Optional[str] = None

    model_config = {"from_attributes": True}

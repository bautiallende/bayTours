from pydantic import BaseModel, Field, field_validator
from datetime import datetime, timezone
from typing import Optional
import pycountry

class CityPermitBase(BaseModel):
    code: str = Field(..., description="Subdivision code según pycountry.subdivisions, e.g. 'GB-EDH'.")
    permit_needed: bool = Field(..., description="Si la ciudad requiere permiso de circulación.")
    comment: Optional[str] = Field(None, description="Comentarios adicionales sobre el permiso.")
    updated_by: str = Field(..., description="Usuario que realizó la última modificación.")

    @field_validator('code')
    def validate_code(cls, v):
        sub = pycountry.subdivisions.get(code=v)
        if not sub:
            raise ValueError(f"Código de ciudad '{v}' no encontrado en pycountry.subdivisions")
        return v

class CityPermit(CityPermitBase):
    name: str = Field(..., description="Nombre de la ciudad obtenido desde pycountry.")
    country_code: str = Field(..., description="Código de país ISO 3166-1 alpha-2.")
    country_name: str = Field(..., description="Nombre del país obtenido desde pycountry.")
    updated_at: datetime = Field(..., description="Fecha y hora UTC de la última actualización.")

    class Config:
        from_attributes = True



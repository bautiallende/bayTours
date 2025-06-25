from typing import List
from uuid import uuid4

from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.orm import Session
from ..dependencies import get_db

from app.schemas.group_city_permits import (
    GroupCityPermitCreate,
    GroupCityPermitRead,
    GroupCityPermitUpdate,
)
from app.service.group_city_permits import (
    create_permit,
    list_permits_by_group,
    update_permit,
    delete_permit,
)

router = APIRouter(tags=["group_city_permits"])


# ────────────────────────────────────────────────────────────────
# CREATE  – POST  (casos excepcionales: alta manual)
# ────────────────────────────────────────────────────────────────
@router.post(
    "/groups/{id_group}/permits",
    response_model=GroupCityPermitRead,
    status_code=status.HTTP_201_CREATED,
)
async def create_group_city_permit_endpoint(
    id_group: str,
    payload: GroupCityPermitCreate,
    db:Session = Depends(get_db),
):
    """
    Crea manualmente un permiso de bus para el grupo-ciudad indicado.
    (El sistema también los genera automáticamente cuando se crea el grupo).
    """
    # Aseguramos que id_group del path y del body coincidan
    payload.id_group = id_group
    payload.id_permit = payload.id_permit or str(uuid4())
    return await create_permit(db, payload)


# ────────────────────────────────────────────────────────────────
# LIST  – GET
# ────────────────────────────────────────────────────────────────
@router.get(
    "/groups/{id_group}/permits",
    response_model=List[GroupCityPermitRead],
)
async def list_group_city_permits_endpoint(
    id_group: str,
    db:Session = Depends(get_db),
):
    """
    Lista todos los permisos de bus asociados a un grupo.
    """
    return await list_permits_by_group(db, id_group)


# ────────────────────────────────────────────────────────────────
# UPDATE  – PATCH
# ────────────────────────────────────────────────────────────────
@router.patch(
    "/group-permits/{id_permit}",
    response_model=GroupCityPermitRead,
)
async def update_group_city_permit_endpoint(
    id_permit: str,
    payload: GroupCityPermitUpdate,
    db:Session = Depends(get_db),
):
    """
    Completa o modifica los datos de un permiso (nº, proveedor, importe, etc.).
    """
    return await update_permit(db, id_permit, payload)


# ────────────────────────────────────────────────────────────────
# DELETE  – DELETE
# ────────────────────────────────────────────────────────────────
@router.delete(
    "/group-permits/{id_permit}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_group_city_permit_endpoint(
    id_permit: str,
    db:Session = Depends(get_db),
):
    """
    Elimina un permiso (por cancelación o error).
    """
    await delete_permit(db, id_permit)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
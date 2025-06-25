from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError, NoResultFound
from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas.group_city_permits import (
    GroupCityPermitCreate,
    GroupCityPermitUpdate,
    GroupCityPermitRead,
)
from app.crud.group_city_permits import (
    create_permit as crud_create,
    list_permits_by_group as crud_list_group,
    get_permit as crud_get,
    update_permit as crud_update,
    delete_permit as crud_delete,
)


# ────────────────────────────────────────────────────────────────
# CREATE
# ────────────────────────────────────────────────────────────────
async def create_permit(
    db: AsyncSession,
    payload: GroupCityPermitCreate,
) -> GroupCityPermitRead:
    # Validar rango de fechas
    if payload.valid_from > payload.valid_to:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="valid_from must be ≤ valid_to",
        )

    try:
        permit = await crud_create(db, payload)
    except IntegrityError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Permit for this group & city already exists.",
        )

    return GroupCityPermitRead.model_validate(permit, from_attributes=True)


# ────────────────────────────────────────────────────────────────
# LIST by group
# ────────────────────────────────────────────────────────────────
async def list_permits_by_group(
    db: AsyncSession,
    id_group: str,
) -> list[GroupCityPermitRead]:
    return await crud_list_group(db, id_group)


# ────────────────────────────────────────────────────────────────
# UPDATE
# ────────────────────────────────────────────────────────────────
async def update_permit(
    db: AsyncSession,
    id_permit: str,
    payload: GroupCityPermitUpdate,
) -> GroupCityPermitRead:
    # Validar rango si se actualiza
    if (
        payload.valid_from is not None
        and payload.valid_to is not None
        and payload.valid_from > payload.valid_to
    ):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="valid_from must be ≤ valid_to",
        )

    try:
        permit = await crud_update(db, id_permit, payload)
    except NoResultFound:
        raise HTTPException(status_code=404, detail="Permit not found.")
    except IntegrityError:
        raise HTTPException(
            status_code=409,
            detail="Conflict while updating permit.",
        )

    return GroupCityPermitRead.model_validate(permit, from_attributes=True)


# ────────────────────────────────────────────────────────────────
# DELETE
# ────────────────────────────────────────────────────────────────
async def delete_permit(
    db: AsyncSession,
    id_permit: str,
) -> None:
    try:
        await crud_delete(db, id_permit)
    except NoResultFound:
        raise HTTPException(status_code=404, detail="Permit not found.")
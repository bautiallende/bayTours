from uuid import uuid4
from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.activity import Activity
from app.schemas.activity import ActivityCreate, ActivityUpdate, ActivityRead
from app.crud import activity as crud_activity
from app.crud import days as crud_days
from app.crud import optionals as crud_optionals


class ManualActivitiesHandler:
    """
    Lógica para actividades opcionales creadas o modificadas manualmente
    desde la API.
    """

    # ─────────────────────────── helpers ───────────────────────────
    async def _validate_city_match(
        self, db: AsyncSession, id_days: str, id_optional: int
    ):
        """Comprueba que la ciudad del día coincide con la del opcional."""
        day = await crud_days.get_day_by_id_days(db, id_days)
        optional = await crud_optionals.get_optional(db, id_optional)

        print(optional)
        if day.city != optional[0].city:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="La actividad no corresponde a la ciudad del día.",
            )

    # ─────────────────────────── create ────────────────────────────
    async def create(
        self,
        db: AsyncSession,
        activity_data: Activity,      # ← igual que en AutoHandler
    ) -> Activity:
        await self._validate_city_match(
            db, activity_data.id_days, activity_data.id_optional
        )

        try:
            return await crud_activity.create(db, activity_data)
        except IntegrityError:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Ya existe una actividad igual en ese día.",
            )

    # ─────────────────────────── update ────────────────────────────
    async def update(
        self,
        db: AsyncSession,
        id_activity: str,
        activity_data: Activity,
    ) -> Activity:
        # Si cambia el día, validar coherencia ciudad-actividad
        if activity_data.id_days is not None:
            await self._validate_city_match(
                db, activity_data.id_days, activity_data.id_optional
            )

        try:
            return await crud_activity.update_activity(
                db, id_activity, activity_data
            )
        except IntegrityError:
            raise HTTPException(
                status_code=409,
                detail="Conflicto al actualizar la actividad.",
            )

    # ─────────────────────────── delete ────────────────────────────
    async def delete(self, db: AsyncSession, id_activity: str) -> None:
        await crud_activity.delete_activity(db, id_activity)
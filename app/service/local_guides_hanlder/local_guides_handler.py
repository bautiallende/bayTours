import json
from sqlalchemy.ext.asyncio  import AsyncSession
from fastapi import HTTPException
from sqlalchemy.exc import IntegrityError
from datetime import time, datetime, timedelta
from uuid import uuid4
from .base_hanlder import LocalGuidesHandler
from app.schemas.local_guides import LocalGuideCreate, LocalGuideUpdate, LocalGuideTariffCreate
from app.models.local_guides import LocalGuides
from app.crud import local_guides as local_guides_functions
from app.crud import local_guide_tariffs as tariffs_crud

class LocalGuideHandler(LocalGuidesHandler):
    """
    Service class for handling local guides operations.
    """

    async def create_local_guide(self, db: AsyncSession, local_guide_data: LocalGuideCreate):
        """
        Create a new local guide.
        """
        # 1. Insertar guía
        guide_row = LocalGuides(
            **local_guide_data.model_dump(
                exclude={"tariffs"},  # tarifas se crean aparte
                exclude_none=True,
            )
        )
        guide_row.id_local_guide = None  # autoincrement
        try:
            await local_guides_functions.create_local_guide(db, guide_row)
        except IntegrityError:
            raise HTTPException(409, "Ya existe un guía con esos datos.")

        # 2. Insertar tarifas (si llegaron)
        if local_guide_data.tariffs:
            for t in local_guide_data.tariffs:
                await tariffs_crud.create_tariff(
                    db=db,
                    tariff_data=t,
                    id_local_guide=guide_row.id_local_guide,
                )

        return guide_row 
    
    async def update_local_guide(self, id_local_guide: int, payload: LocalGuideUpdate, db: AsyncSession):
        """
        Update an existing local guide.
        """
        # 1. Traer la entidad ORM
        guide = await local_guides_functions.get_local_guide_by_id(
            id_local_guide=id_local_guide, db=db
        )

        # 2. Sobrescribir solo los campos enviados (excepto tariffs)
        for field, value in payload.model_dump(
            exclude={"tariffs"}, exclude_none=True
        ).items():
            setattr(guide, field, value)

        # 3. Persistir cambios básicos (sin tocar tarifas todavía)
        try:
            await local_guides_functions.update_local_guide(db=db, local_guide_data=guide)
        except IntegrityError:
            raise HTTPException(409, "Conflicto al actualizar el guía.")

        # 4. Si llega lista de tarifas → reemplazar por completo
        if payload.tariffs is not None:
            # a) borrar todas las tarifas actuales
            await tariffs_crud.delete_all_tariffs_by_guide(
                db=db, id_local_guide=id_local_guide
            )
            # b) crear las nuevas tarifas
            for t in payload.tariffs:
                await tariffs_crud.create_tariff(
                    db=db,
                    tariff_data=LocalGuideTariffCreate(**t.model_dump()),
                    id_local_guide=id_local_guide,
                )

        return guide  # el esquema Read las serializará con tariffs recargadas

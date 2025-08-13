from .base_handler import BaseHandler
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException
from app.schemas.guides import GuideCreate, GuideUpdate
from app.models.guides import Guides
from app.models.guide_availability import GuideAvailability
from app.crud import guides as guides_functions
from app.crud import guides_availability as avail_crud

class GuidesHandler(BaseHandler):

    async def create(self, db: AsyncSession, guide_data: GuideCreate):
        # 1. Insertar guía
        try:
            guide_row = await guides_functions.create_guide(db=db, payload=guide_data)
        except IntegrityError:
            raise HTTPException(409, "Ya existe un guía con esos datos.")

        # 2. Insertar availability si viene en el payload
        if guide_data.availability:
            for slot in guide_data.availability:
                # Validar solapamientos
                overlaps = await avail_crud.list_slots(db, guide_row.id_guide)
                for s in overlaps:
                    if s.start_date <= slot.start_date <= s.end_date or \
                       s.start_date <= slot.end_date <= s.end_date:
                        raise HTTPException(
                            400,
                            "El rango de disponibilidad se solapa con otro existente.",
                        )

                slot_row = GuideAvailability(
                    **slot.model_dump(exclude_none=True),
                    id_guide=guide_row.id_guide,
                )
                await avail_crud.create_slot(db=db, slot=slot_row)

        return guide_row
    

    async def update(self, db: AsyncSession, id_guide: int, guide_data: GuideUpdate,):
        # 1. Actualizar datos básicos del guía
        try:
            guide_row = await guides_functions.update_guide(
                db=db, id_guide=id_guide, payload=guide_data
            )
        except IntegrityError:
            raise HTTPException(409, "Conflicto al actualizar el guía.")
        except guides_functions.NoResultFound:  # si tu CRUD lanza esto
            raise HTTPException(404, "Guide not found")

        # 2. procesar availability (si se envía)
        if guide_data.availability:
            # obtener slots existentes una sola vez
            existing = {s.id_availability: s for s in await avail_crud.list_slots(db, id_guide)}

            for slot_payload in guide_data.availability:
                if slot_payload.id_availability:
                    # — editar —
                    if slot_payload.id_availability not in existing:
                        raise HTTPException(404, "Bloque de disponibilidad no encontrado")
                    await avail_crud.update_slot(db, slot_payload.id_availability, slot_payload)
                else:
                    # — crear nuevo —
                    new_slot = GuideAvailability(
                        **slot_payload.model_dump(exclude={"id_availability"}),
                        id_guide=id_guide,
                    )
                    # validar solapamientos rápido contra `existing`
                    for old in existing.values():
                        overlap = (
                            new_slot.start_date <= old.end_date
                            and old.start_date <= new_slot.end_date
                        )
                        if overlap:
                            raise HTTPException(
                                400,
                                "El nuevo bloque de disponibilidad se solapa con otro existente.",
                            )
                    await avail_crud.create_slot(db, new_slot)
                    # añadirlo al dict para que los siguientes chequeen solape
                    existing[new_slot.id_availability] = new_slot

        return guide_row
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from sqlalchemy.exc import IntegrityError, NoResultFound
import json
from datetime import datetime
from app.models.circuits import Circuit
from app.schemas.guides import GuideCreate, GuideUpdate
from app.models.guides import Guides
from app.models.group import Group




async def create_guide(db: AsyncSession, payload: GuideCreate) -> Guides:
    guide = Guides(**payload.model_dump(exclude={"availability"}))
    comments = [payload.comment] if payload.comment else []
    guide.comment = json.dumps(comments)  # Inicializar como lista vacía
    db.add(guide)
    try:
        db.commit()
        db.refresh(guide)
    except IntegrityError:
        db.rollback()
        raise
    return guide




async def update_guide(db: AsyncSession, id_guide: int, payload: GuideUpdate) -> Guides:
    result = db.execute(select(Guides).where(Guides.id_guide == id_guide))
    guide = result.scalar_one_or_none()
    if not guide:
        raise NoResultFound

    # Manejar la lista de comentarios
    existing_comments = json.loads(guide.comment) if guide.comment else []
    if payload.comment and payload.comment.strip():  # Verificar si hay un nuevo comentario y no está vacío o solo contiene espacios
        new_comment = f'({datetime.now().strftime("%d/%m/%y %H:%M")}) - {payload.comment}'
        existing_comments.insert(0, new_comment)
        guide.comment = json.dumps(existing_comments)
        
    for field, value in payload.model_dump(
        exclude={"availability", "comment"}, exclude_none=True
    ).items():
        setattr(guide, field, value)

    try:
        db.commit()
        db.refresh(guide)
    except IntegrityError:
        db.rollback()
        raise
    return guide



async def get_guide_group(id_group:str, db:AsyncSession):
    result = db.execute(select(Guides).join(Group, Group.id_guide == Guides.id_guide).where(Group.id_group == id_group))
    guide = result.scalar_one_or_none()
    return guide 



async def get_guide(db: AsyncSession, id_guide: int | str):
    # 1) Ficha con relaciones cargadas
    stmt = (
        select(Guides)
        .where(Guides.id_guide == id_guide)
        .options(
            selectinload(Guides.availability),
            selectinload(Guides.evaluations),
        )
    )
    result = db.execute(stmt)
    guide = result.scalar_one_or_none()
    if guide is None:
        return None

    # 2) Recolectar group_ids de availability
    group_ids = [
        s.id_group for s in getattr(guide, "availability", []) if getattr(s, "id_group", None)
    ]
    if not group_ids:
        return guide

    # 3) group_id -> circuit_id
    res = db.execute(
        select(Group.id_group, Group.circuit).where(Group.id_group.in_(group_ids))
    )
    group_to_circuit = {row.id_group: row.circuit for row in res.all()}

    # 4) circuit_id -> circuit_name
    circuit_ids = [cid for cid in group_to_circuit.values() if cid is not None]
    circuit_names = {}
    if circuit_ids:
        res2 = db.execute(
            select(Circuit.id, Circuit.name).where(Circuit.id.in_(circuit_ids))
        )
        circuit_names = {row.id: row.name for row in res2.all()}

    # 5) Anotar en cada slot (los lee tu GuideAvailabilityRead)
    for slot in getattr(guide, "availability", []):
        gid = getattr(slot, "id_group", None)
        if gid:
            cid = group_to_circuit.get(gid)
            slot.circuit_id = cid
            slot.circuit_name = circuit_names.get(cid) if cid is not None else None
        else:
            slot.circuit_id = None
            slot.circuit_name = None

    return guide


async def get_all_guides(db: AsyncSession):
    # 1) Guías con relaciones cargadas (una sola ronda a la BD)
    stmt = (
        select(Guides)
        .options(
            selectinload(Guides.availability),   # slots
            selectinload(Guides.evaluations),    # evaluaciones
        )
    )
    result = db.execute(stmt)
    guides = result.scalars().all()

    # 2) Recolectar todos los id_group presentes en availability
    group_ids = {
        slot.id_group
        for g in guides
        for slot in getattr(g, "availability", [])
        if getattr(slot, "id_group", None)
    }

    if group_ids:
        # 3) group_id -> circuit_id
        res = db.execute(
            select(Group.id_group, Group.circuit).where(Group.id_group.in_(list(group_ids)))
        )
        group_to_circuit = {row.id_group: row.circuit for row in res.all()}

        # 4) circuit_id -> circuit_name
        circuit_ids = {cid for cid in group_to_circuit.values() if cid is not None}
        circuit_names = {}
        if circuit_ids:
            res2 = db.execute(
                select(Circuit.id, Circuit.name).where(Circuit.id.in_(list(circuit_ids)))
            )
            circuit_names = {row.id: row.name for row in res2.all()}

        # 5) Anotar atributos efímeros en cada slot (los leerá tu Pydantic)
        for g in guides:
            for slot in getattr(g, "availability", []):
                gid = getattr(slot, "id_group", None)
                if gid:
                    cid = group_to_circuit.get(gid)
                    # estos campos deben existir en tu GuideAvailabilityRead
                    slot.circuit_id = cid
                    slot.circuit_name = circuit_names.get(cid) if cid is not None else None
                else:
                    slot.circuit_id = None
                    slot.circuit_name = None

    return guides
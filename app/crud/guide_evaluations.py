from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import delete
from sqlalchemy.exc import IntegrityError, NoResultFound
from app.models.guides import Guides
from app.models.group import Group
from app.models.guide_evaluations import GuideEvaluation
from app.schemas.guides import GuideEvaluationCreate, GuideEvaluationUpdate




async def create_evaluation(db: AsyncSession, payload: GuideEvaluation) -> Guides:
    db.add(payload)
    try:
        db.commit()
        db.refresh(payload)
    except IntegrityError:
        db.rollback()
        raise
    return payload


# LIST by guide
async def list_by_guide(db: AsyncSession, id_guide: int):
    res = db.execute(
        select(GuideEvaluation).where(GuideEvaluation.id_guide == id_guide)
    )
    return res.scalars().all()

# GET one
async def get_one(db: AsyncSession, id_eval: int) -> GuideEvaluation | None:
    return db.get(GuideEvaluation, id_eval)

# UPDATE
async def update_evaluation(
    db: AsyncSession, id_eval: int, payload: GuideEvaluationUpdate
) -> GuideEvaluation:
    row = db.get(GuideEvaluation, id_eval)
    if row is None:
        raise NoResultFound

    # Sólo permitimos cambiar rating/comment/source (+ opcional id_group)
    for k, v in payload.model_dump(exclude_none=True).items():
        setattr(row, k, v)

    try:
        db.commit()
        db.refresh(row)
    except IntegrityError:
        db.rollback()
        raise
    return row

# DELETE
async def delete_evaluation(db: AsyncSession, id_eval: int) -> None:
    db.execute(delete(GuideEvaluation).where(GuideEvaluation.id_eval == id_eval))
    db.commit()
from sqlalchemy.ext.asyncio import AsyncSession
from app.schemas.guides import GuideEvaluationCreate, GuideEvaluationUpdate
from app.models.guide_evaluations import GuideEvaluation
from app.crud import guides as guides_crud
from app.crud import guide_evaluations as eval_crud  # crea este CRUD mínimo
from fastapi import HTTPException
from .guide_evaluations_handler import evaluation_handler


async def add_evaluation(db: AsyncSession, id_guide: int, evaluation: GuideEvaluationCreate):
    handler = evaluation_handler.get('new')
    return await handler.add(db=db, id_guide=id_guide, evaluation=evaluation)

async def list_by_guide(db: AsyncSession, id_guide: int):
    handler = evaluation_handler.get('get')
    return await handler.list_by_guide(db=db, id_guide=id_guide)

async def update_evaluation(db: AsyncSession, id_eval: int, payload: GuideEvaluationUpdate):
    handler = evaluation_handler.get('update')
    return await handler.update(db=db, id_eval=id_eval, payload=payload)

async def delete_evaluation(db: AsyncSession, id_eval: int):
    handler = evaluation_handler.get('delete')
    await handler.delete(db=db, id_eval=id_eval)
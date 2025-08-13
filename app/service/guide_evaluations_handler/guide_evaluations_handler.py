from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import NoResultFound, IntegrityError

from app.crud import guides as guides_crud
from app.crud import guide_evaluations as eval_crud
from app.models.guide_evaluations import GuideEvaluation
from app.schemas.guides import (
    GuideEvaluationCreate,
    GuideEvaluationUpdate,
)


class GuideEvaluationsHandler:
    """Lógica de negocio para evaluaciones de Tour Leaders."""

    async def add(
        self,
        db: AsyncSession,
        id_guide: int,
        evaluation: GuideEvaluationCreate,
    ):
        # validar guía
        if await guides_crud.get_guide(db, id_guide) is None:
            raise HTTPException(status_code=404, detail="Guide not found")

        row = GuideEvaluation(
            **evaluation.model_dump(exclude_none=True),
            id_guide=id_guide,
        )
        try:
            return await eval_crud.create_evaluation(db=db, payload=row)
        except IntegrityError:
            raise HTTPException(status_code=409, detail="Conflict creating evaluation")

    async def list_by_guide(self, db: AsyncSession, id_guide: int):
        # opcional: validar existencia del guía para mejor 404
        if await guides_crud.get_guide(db, id_guide) is None:
            raise HTTPException(status_code=404, detail="Guide not found")
        return await eval_crud.list_by_guide(db=db, id_guide=id_guide)

    async def update(
        self,
        db: AsyncSession,
        id_eval: int,
        payload: GuideEvaluationUpdate,
    ):
        try:
            return await eval_crud.update_evaluation(db=db, id_eval=id_eval, payload=payload)
        except NoResultFound:
            raise HTTPException(status_code=404, detail="Evaluation not found")
        except IntegrityError:
            raise HTTPException(status_code=409, detail="Conflict updating evaluation")

    async def delete(self, db: AsyncSession, id_eval: int):
        # si quieres validar existencia:
        if await eval_crud.get_one(db, id_eval) is None:
            raise HTTPException(status_code=404, detail="Evaluation not found")
        await eval_crud.delete_evaluation(db=db, id_eval=id_eval)
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..dependencies import get_db
from datetime import date
from app.service import guide as guide_service
from app.service import guide_availability as availability_service
from app.service import guide_availability as guide_availability_service
from app.service import guide_evaluations as eval_service
from app.schemas.guides import (
    GuideCreate,
    GuideUpdate,
    GuideRead,
    GuideAvailabilityCreate,
    GuideAvailabilityUpdate,
    GuideEvaluationCreate,
    GuideEvaluationUpdate,
    GuideEvaluationRead,
)

router = APIRouter(
    prefix="/guides",
    tags=["guides"],
)



# ────────────────────────────────────────────────────────────────
# 1.  Alta de guía (con availability opcional)
# ────────────────────────────────────────────────────────────────
@router.post("")
async def create_guides(guides_data:GuideCreate, db:Session = Depends(get_db)):
    result =  await guide_service.create(guides_data=guides_data, db=db)
    if not result: 
        raise HTTPException(status_code=400, detail="Guide not created")
    return result



# ────────────────────────────────────────────────────────────────
# 2.  Modificación (datos + availability en un solo payload)
# ────────────────────────────────────────────────────────────────
@router.patch("/{id_guide}", response_model=GuideRead,)
async def update_guide(id_guide: int, payload: GuideUpdate, db: Session = Depends(get_db),):
    return await guide_service.update(db=db, id_guide=id_guide, guide_data=payload)


# ────────────────────────────────────────────────────────────────
# 3.  GET ficha completa (info + availability + evaluations)
# ────────────────────────────────────────────────────────────────
@router.get("/by_id/{id_guide}", response_model=GuideRead,)
async def get_guide(id_guide: int, db:Session = Depends(get_db),):
    return await guide_service.get_guide(db=db, id_guide=id_guide)


@router.get("/get_dispo")
async def get_guides_dispo(starting_date:date, ending_date:date, db:Session = Depends(get_db)):
    result = await guide_availability_service.get_guides_dispo(starting_date=starting_date, ending_date=ending_date, db=db)
    return result


@router.get("/get_group_dispo")
async def get_group_dispo(starting_date:date, ending_date:date, id_group:str, db:Session = Depends(get_db)):
    actual_guide = await guide_service.get_guide_group(db=db, id_group=id_group)

    all_guides = await guide_availability_service.get_guides_dispo(starting_date=starting_date, ending_date=ending_date, db=db)

    all_guides = [{"id":guide.id_guide, "name":guide.name + " " + guide.surname} for guide in all_guides]

    if actual_guide:
        # Filtrar los guías disponibles para excluir el guía actual
        available_guides = [guide for guide in all_guides if guide.get("id_guide") != actual_guide.id_guide]

        response = {
            "current_guide":{
                "id": actual_guide.id_guide,
                "name": actual_guide.name +" " +actual_guide.surname 
                },
            "available_guides":available_guides
            }
    else:
        response = {
            "current_guide":{
                "id": '',
                "name": 'Sin Guia asignado'
                },
            "available_guides":all_guides
            }  

    return response



# ────────────────────────────────────────────────────────────────
# 4.  Listar todos los guías
# ────────────────────────────────────────────────────────────────
@router.get("",response_model=list[GuideRead],)
async def list_guides(db: Session = Depends(get_db)):
    return await guide_service.list_all(db=db)

# ────────────────────────────────────────────────────────────────
# 5.  Buscar guías disponibles en un rango
# ────────────────────────────────────────────────────────────────
@router.get(
    "/available",
    response_model=list[GuideRead],
)
async def list_available_guides(
    start: date,
    end: date,
    db: Session = Depends(get_db),
):
    return await availability_service.get_available_guides(
        db=db, start_date=start, end_date=end
    )


# ────────────────────────────────────────────────────────────────
# 6.  Gestionar VACACIONES / bloque de fechas
# ────────────────────────────────────────────────────────────────
@router.post(
    "/{id_guide}/availability",
    response_model=GuideAvailabilityUpdate,
    status_code=status.HTTP_201_CREATED,
)
async def add_vacation_slot(
    id_guide: int,
    slot: GuideAvailabilityCreate,
    db: Session = Depends(get_db),
):
    return await availability_service.add_slot(
        db=db, id_guide=id_guide, payload=slot
    )


@router.patch(
    "/availability/{id_availability}",
    response_model=GuideAvailabilityUpdate,
)
async def update_vacation_slot(
    id_availability: int,
    slot: GuideAvailabilityUpdate,
    db: Session = Depends(get_db),
):
    return await availability_service.update_slot(
        db=db, id_availability=id_availability, payload=slot
    )


@router.delete(
    "/availability/{id_availability}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_vacation_slot(
    id_availability: int,
    db: Session = Depends(get_db),
):
    await availability_service.delete_slot(db=db, id_availability=id_availability)


# ────────────────────────────────────────────────────────────────
# 7.  Evaluaciones
# ────────────────────────────────────────────────────────────────
@router.post(
    "/{id_guide}/evaluations",
    response_model=GuideEvaluationRead,
    status_code=status.HTTP_201_CREATED,
)
async def add_evaluation(
    id_guide: int,
    payload: GuideEvaluationCreate,
    db: Session = Depends(get_db),
):
    return await eval_service.add_evaluation(
        db=db, id_guide=id_guide, evaluation=payload
    )


@router.get("/{id_guide}/evaluations", response_model=List[GuideEvaluationRead])
async def list_evaluations_for_guide(
    id_guide: int,
    db: Session = Depends(get_db),
):
    return await eval_service.list_by_guide(db=db, id_guide=id_guide)

@router.patch("/evaluations/{id_eval}", response_model=GuideEvaluationRead)
async def update_evaluation_endpoint(
    id_eval: int,
    payload: GuideEvaluationUpdate,
    db: Session = Depends(get_db),
):
    return await eval_service.update_evaluation(db=db, id_eval=id_eval, payload=payload)

@router.delete("/evaluations/{id_eval}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_evaluation_endpoint(
    id_eval: int,
    db: Session = Depends(get_db),
):
    await eval_service.delete_evaluation(db=db, id_eval=id_eval)
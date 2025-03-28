from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..dependencies import get_db
from app.schemas.guides import GuideBase, Guide
from app.service import guide as guide_service
from app.service import guide_availability as guide_availability_service
from datetime import date

router = APIRouter(
    prefix="/guides",
    tags=["guides"],
)


@router.post("")
async def create_guides(guides_data:GuideBase, db:Session = Depends(get_db)):
    result =  await guide_service.create(guides_data=guides_data, db=db)
    if not result: 
        raise HTTPException(status_code=400, detail="Guide not created")
    return result


@router.put("")
async def update_guides(guide_data:Guide, db:Session = Depends(get_db)):
    result = await guide_service.update(guide_data=guide_data, db=db)
    if not result:
        raise HTTPException(status_code=404, detail="Guide not found")
    return result


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
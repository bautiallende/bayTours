from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..dependencies import get_db
from datetime import date
from app.schemas.optionals_purchase import OptionalsPurchase
from app.service import optional_purchase as optional_purchase_service

router = APIRouter(
    prefix="/optionals_purchase",
    tags=["optionals_purchase"],
    )


@router.post('')
async def create_optionales(optionals_purchase_data:OptionalsPurchase, db:Session=Depends(get_db)):
    result = await optional_purchase_service.create_one(optionals_purchase_data=optionals_purchase_data, db=db)

    if not result:
        raise HTTPException(status_code=400, detail="Optional purchase not created")
    
    response = {
            "status": "success",
            "message": "El opcional ha sido creado correctamente.",
            "updated_optionals": {
                "id": result.id,
                "client_id": result.client_id
                }
            }
    return response



@router.put('')
async def update_optionales(optional_purchase_data:OptionalsPurchase, db:Session=Depends(get_db)):
    result = await optional_purchase_service.update_optional_purchase(optionals_purchase_data=optional_purchase_data, db=db)
    if not result:
        raise HTTPException(status_code=404, detail="Optional purchase not found")
    response = {
            "status": "success",
            "message": "El opcional ha sido actualizado correctamente.",
            "updated_optionals": result
            }
    return response



@router.delete('')
async def delete_optional_purchase(id_group:str, client_id:str, id_activity:str, db:Session=Depends(get_db)):
    result = await optional_purchase_service.delete_optional_purchase(id_group=id_group, client_id=client_id, id_activity=id_activity, db=db)
    if not result:
        raise HTTPException(status_code=404, detail="Optional purchase not found")
    response = {
            "status": "success",
            "message": "El opcional ha sido eliminado correctamente."
            }
    return response


@router.get('')
async def get_optionals_with_id_days(id_group:str, id_days:str, db:Session = Depends(get_db)):
    optional_purchases_data = await optional_purchase_service.get_optionals_with_id_days(id_group=id_group, id_days=id_days, db=db)
    if not optional_purchases_data:
        raise HTTPException(status_code=404, detail="No optional purchases found")
    response = {
            "status": "success",
            "optionals": optional_purchases_data
            }
    return response


@router.get('/clients_optionals')
async def get_clients_optionals(group_id:str, id_days:str, client_id:str, db:Session = Depends(get_db)):
    optionals = await optional_purchase_service.get_client_optionals(db=db, group_id=group_id, id_days=id_days, client_id=client_id)
    if not optionals:
        raise HTTPException(status_code=404, detail="No optional purchases found for this client")
    response = {
            "status": "success",
            "optionals": optionals
            }
    return response
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..dependencies import get_db
from app.service import transport as transport_service
from app.service import transport_company as transport_company_service

router = APIRouter(
    prefix="/transports",
    tags=["transports"],
)


@router.put('/update_bus')
async def update_bus(id_group: str, company_id: str, bus_code:str, db:Session = Depends(get_db)):
    print(f'company id: {company_id}')
    print(f'group id: {id_group}')
    updated_bus = await transport_service.update_transport(db, id_group=id_group, company_id=company_id, bus_code=bus_code)
    if updated_bus is None:
        raise HTTPException(status_code=404, detail="Transport not updated")
    
    response = {
        "status": "success",
        "message": "El bus ha sido actualizado correctamente.",
        "updated_bus": {
            "company_name": updated_bus['company'],
            "bus_code": updated_bus['transport'].bus
            }
        }
    return response


@router.get('/transport_by_id_group')
async def get_transport_by_id_group(id_group:str, db:Session = Depends(get_db)):
    transport = await transport_service.get_transport(db=db, id_group=id_group)
    if transport is None:
        raise HTTPException(status_code=404, detail="Transport not found")
    return transport


@router.get('/companys')
async def get_companys(db:Session=Depends(get_db)):
    companys = await transport_company_service.get_companys(db)
    return companys
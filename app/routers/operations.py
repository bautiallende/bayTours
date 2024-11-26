from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..dependencies import get_db
from datetime import date
from app.service import operations as operation_service
from app.service import group as group_service


router = APIRouter(
    prefix="/operations",
    tags=["operations"],
)


@router.get('/get_operations_dispo')
async def get_operations_dispo(id_group:str, db:Session = Depends(get_db)):

    operations_data = await operation_service.get_operations(db=db)

    group_data = await group_service.get_group(db=db, id_group=id_group)

    if group_data.id_operations:
        operations =  [operation for operation in operations_data if operation.id_operation != group_data.id_operations]
    else:
        operations = operations_data
    
    return operations
    

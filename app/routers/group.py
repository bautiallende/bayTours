from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.schemas import group
from ..dependencies import get_db
from app.service import group as group_service

router = APIRouter(
    prefix="/groups",
    tags=["groups"],
)

@router.get("/get_group", response_model=group.Group)
async def get_group(id_group:str, db: Session = Depends(get_db)):
    db_group = await group_service.get_group(db, id_group=id_group)
    if db_group is None:
        raise HTTPException(status_code=404, detail="Group not found")
    return db_group



@router.get('/tabla_groups')
async def get_tabla_groups(id_grupo: str = None, bus_company: str = None, guide_name: str = None, operaciones_name: str = None, status: str = None, 
                           assistant_name: str = None, has_qr: bool = None, current_city: str = None, current_hotel: str = None, sort_by: str = None, order: str = None,db:Session = Depends(get_db)):
    
    groups = await group_service.get_tabla_groups(db=db, id_grupo=id_grupo, bus_company=bus_company, guide_name=guide_name, operaciones_name=operaciones_name, status=status,
                                                  assistant_name=assistant_name, has_qr=has_qr, current_city=current_city, current_hotel=current_hotel, sort_by=sort_by, order=order)
    print(f'La salida de tabla grupos es: \n{group}')
    return groups
                           

@router.get('/groups_filter_options')
async def groups_filter_options(db: Session = Depends(get_db)):

    result = await group_service.get_group_filters(db=db)

    return result


@router.get('/group_data')
async def group_data(id_group:str , table:str, db: Session = Depends(get_db)):
    group_data = await group_service.get_group_data(db=db, id_group=id_group, table=table)
    return group_data
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.schemas import group
from ..dependencies import get_db
from app.service import group as group_service
from app.service import operations as operations_service
from app.service import assistant as assistant_service
from app.service import responsable_hoteles as responsable_hoteles_service


router = APIRouter(
    prefix="/groups",
    tags=["groups"],
)



@router.put('/update_operations')
async def update_operations(id_group:str, id_operations:str, db:Session = Depends(get_db)):
    group_data =  await group_service.update_operations(db=db, id_group=id_group, id_operations=id_operations)
    
    if group_data:
        operations_data = await operations_service.get_one(db=db, id_operation=group_data.id_operations)

    else:
        return "grupo no encontrado"
    
    response = {
        "status": "success",
        "message": "El operador ha sido actualizado correctamente.",
        "updated_operations": {
            "id": operations_data.id_operation,
            "name": f"{operations_data.name} {operations_data.surname}"
            }
        }
    return response


@router.put('/update_assistante')
async def update_assistante(id_group:str, id_assistant:str, db:Session = Depends(get_db)):
    group_data = await group_service.update_assistant(db=db, id_group=id_group, id_assistant=id_assistant)

    if group_data:
        assistant_data = await assistant_service.get_one(db=db, id_assistant=group_data.id_assistant)
    
    else:
        return "grupo no encontrado"
    
    response = {
        "status": "success",
        "message": "El asistente ha sido actualizado correctamente.",
        "updated_assistant": {
            "id": assistant_data.id_assistant,
            "name": f"{assistant_data.name} {assistant_data.surname}"
            }
    }

    return response





@router.put('/update_guide')
async def update_guide(id_group:str, id_guide:int, db:Session = Depends(get_db)):
    updated_guide = await group_service.update_guide(db, id_group=id_group, id_guide=id_guide)

    if updated_guide is None:
        raise HTTPException(status_code=404, detail="Guide not updated")
    # Construir la respuesta JSON
    response = {
        "status": "success",
        "message": "El guía ha sido actualizado correctamente.",
        "updated_guide": {
            "id": updated_guide.id_guide,
            "name": f"{updated_guide.name} {updated_guide.surname}"
        }
    }
    return response


@router.put('/update_responsable_hotels')
async def update_responsable_hotel(id_group:str, id_responsible_hotels:str, db:Session=Depends(get_db)):
    group_data = await group_service.update_responsable_hotel(db, id_group=id_group, id_responsible_hotels=id_responsible_hotels)

    if group_data:
        responsible_hotel_data = await responsable_hoteles_service.get_one(db=db, id_responsible_hotels=id_responsible_hotels)
    
    else:
        return "grupo no encontrado"
    
    response = {
        "status": "success",
        "message": "El responsable de hoteles ha sido actualizado correctamente.",
        "updated_responsable_hotels": {
            "id": responsible_hotel_data.id_responsible_hotels,
            "name": f"{responsible_hotel_data.name} {responsible_hotel_data.surname}"
            }
        }
    return response


@router.put('/update_qr')
async def update_qr(id_group:str, has_qr:bool, db:Session=Depends(get_db)):
    group_data = await group_service.update_qr(db=db, id_group=id_group, has_qr=has_qr)

    if group_data:
        response = {
            "status": "success",
            "message": "El código QR ha sido actualizado correctamente.",
            "updated_group": {
                "id_group": group_data.id_group,
                "has_qr": group_data.QR
                }
            }
        return response
    
    else:
        return "grupo no encontrado"
        


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
    print(f'Entrada por el endpoint group_data con los parametros: id_group {id_group}, y table: {table} ')
    group_data = await group_service.get_group_data(db=db, id_group=id_group, table=table)
    return group_data


# @router.get(f'/{id_group}/available_guides')
# async def available_guides(db: Session = Depends(get_db)):
#     pass
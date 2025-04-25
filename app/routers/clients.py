from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import models, crud
from app.service import clients as clients_service 
from app.schemas import clients
from ..dependencies import get_db


router = APIRouter(
    prefix="/clients",
    tags=["clients"],
)

#@router.post("/", response_model=clients.Clients)
#def create_client(client: clients.ClientCreate, db: Session = Depends(get_db)):
#    return create_client_db(db=db, client=client)

#@router.get("/{client_id}", response_model=clients.Clients)
#def read_client(client_id: int, db: Session = Depends(get_db)):
#    db_client = get_clients(db, client_id=client_id)
#    if db_client is None:
#        raise HTTPException(status_code=404, detail="Client not found")
#    return db_client


@router.get("/clents_group")
async def get_clents_group(id_group: str, db: Session = Depends(get_db)):
     response = await clients_service.get_clients_by_group_id(db=db, id_group=id_group)

     if not response:
         raise HTTPException(status_code=404, detail="No clients found for this group")
     return response



@router.put("/update_client")
async def update_client(client_data: clients.ClientUpdate, db: Session = Depends(get_db)):
    db_client = crud.clients.get_client(db=db, client_id=client_data.id_clients)
    if not db_client:
        raise HTTPException(status_code=404, detail="Client not found")
    
    response = await clients_service.update_client(db=db, client_data=client_data)
    return response
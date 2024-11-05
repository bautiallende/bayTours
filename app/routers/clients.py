from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import models, crud
from app.service.clients import get_clients 
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

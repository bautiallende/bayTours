from sqlalchemy.orm import Session
from sqlalchemy.ext.asyncio import AsyncSession
from app.models import clients as clients_model
from app.schemas import clients
from app.models.client_group import ClientGroup
from sqlalchemy.future import select

def get_client(db: Session, client_id: int):
    return db.query(clients_model.Clients).filter(clients_model.Clients.id_clients == client_id).first()

def create_client(db: AsyncSession, client: clients_model.Clients):
    db.add(client)
    db.commit()
    db.refresh(client)
    return client


async def get_clients(db: Session, paternal_surname: str, first_name:str, passaport:str = None, birth_date = None):
   query = db.query(clients_model.Clients).filter(clients_model.Clients.paternal_surname == paternal_surname, clients_model.Clients.first_name == first_name)

   if passaport:
      query = query.filter(clients_model.Clients.passport == passaport)
   if birth_date:
      query = query.filter(clients_model.Clients.birth_date == birth_date)
   
   return query.first()


async def get_clients_by_group_id(db:AsyncSession, id_group: str):
   query = select(
      clients_model.Clients.id_clients,
      clients_model.Clients.paternal_surname, 
      clients_model.Clients.mother_surname, 
      clients_model.Clients.first_name,
      clients_model.Clients.second_name,
      clients_model.Clients.sex,
      clients_model.Clients.phone,
      clients_model.Clients.mail,
      clients_model.Clients.birth_date,
      clients_model.Clients.nationality,
      clients_model.Clients.passport,
      clients_model.Clients.vtc_passport
   ).join(ClientGroup, ClientGroup.id_clients == clients_model.Clients.id_clients, isouter=True
          ).filter(ClientGroup.id_group == id_group)


   result = db.execute(query)
   client = result.fetchall()

   return client

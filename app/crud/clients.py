from sqlalchemy.orm import Session
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import func
from app.models import clients as clients_model
from app.schemas import clients
from app.models.client_group import ClientGroup
from sqlalchemy.future import select
from app.models.client_group import ClientGroup
from datetime import datetime

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


async def get_clients_by_group_id(db:AsyncSession, id_group: str, filters: dict = None):
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
      clients_model.Clients.vtc_passport,
      ClientGroup.packages, 
      ClientGroup.room_type, 
      ClientGroup.shown,
      ClientGroup.pax_number,
   ).join(ClientGroup, ClientGroup.id_clients == clients_model.Clients.id_clients, isouter=True
          ).filter(ClientGroup.id_group == id_group).order_by(ClientGroup.pax_number)

   print(f'\nfilters en clients {filters}\n')
   
   if filters:
      if filters.get("names"):
            name_filter = filters["names"]
            query = query.filter(clients_model.Clients.id_clients.in_(name_filter))
      if filters.get("min_age"):
         date_nac = datetime.now().year - filters["min_age"]
         query = query.filter(func.extract("year", clients_model.Clients.birth_date) <= date_nac) 
      if filters.get("date"):
         if filters.get("date", {}).get('op','') == 'gt':
            query = query.filter(clients_model.Clients.birth_date > filters["date"]['value'])
         elif filters.get("date", {}).get('op','') == 'lt':
            query = query.filter(clients_model.Clients.birth_date < filters["date"]['value'])
      if filters.get('nationality'):
         query = query.filter(clients_model.Clients.nationality == filters["nationality"])
      if filters.get('vtc_passport'):
         if filters.get('vtc_passport', {}).get('op','') == 'gt':
            query = query.filter(clients_model.Clients.vtc_passport > filters["vtc_passport"]['value'])
         elif filters.get('vtc_passport', {}).get('op','') == 'lt':
            query = query.filter(clients_model.Clients.vtc_passport < filters["vtc_passport"]['value'])
      if filters.get("packages"):
         value = filters["packages"]
         if isinstance(value, list):
            query = query.filter(ClientGroup.packages.in_(value))
         else:
            query = query.filter(ClientGroup.packages == value)
      if filters.get("room_type"):
         value = filters["room_type"]
         if isinstance(value, list):
            query = query.filter(ClientGroup.room_type.in_(value))
         else:
            query = query.filter(ClientGroup.room_type == value)
      if filters.get("shown") or filters.get("shown") == False:
         if filters.get("shown") == True:
            query = query.filter(ClientGroup.shown == 1)
         elif filters.get("shown") == False:
            query = query.filter(ClientGroup.shown == 0)
         #query = query.filter(ClientGroup.shown == filters["shown"])
      if filters.get('sex'):
         if filters.get('sex') == 'O':
            query = query.filter(clients_model.Clients.sex != filters['sex'])
         else:
            query = query.filter(clients_model.Clients.sex == filters['sex'])


   result = db.execute(query)
   rows = [dict(r._mapping) for r in result]

   unique_rows = {}
   for row in rows:
      unique_rows[row["id_clients"]] = row  

   return list(unique_rows.values())


async def get_client_by_id(db:AsyncSession, id_client:int):
   query = select(clients_model.Clients).where(clients_model.Clients.id_clients == id_client)
   result = db.execute(query)
   client = result.scalars().first()
   return client
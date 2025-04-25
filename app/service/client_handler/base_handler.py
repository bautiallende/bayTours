from sqlalchemy.ext.asyncio import AsyncSession
from app.models.clients import Clients
from app.schemas.clients import ClientUpdate
from app.crud import clients as clients_functions
import pycountry

NATIONALITY_MAP = {
    'MEXICANA': 'MX',
    'MEXICANO':  'MX',
    'MEXICO':    'MX',
    'ESTADOUNIDENSE': 'US',
    'ESTADOS UNIDOS': 'US',
    # …añade las que necesites
}

def normalize_nationality(raw):
    if not raw:
        return None
    key = raw.strip().upper()
    # primer paso: lookup exacto en tu mapeo
    if key in NATIONALITY_MAP:
        return NATIONALITY_MAP[key]
    # si no, intentar buscar en pycountry (por nombre oficial o común)
    for country in pycountry.countries:
        # comparo mayúsculas para name y names comunes
        if key in country.name.upper():
            return country.alpha_2
    # fallback: devolver el raw (o None)
    return None

class  BaseHandler:
    def __init__(self):
        pass

    async def update(self, db: AsyncSession, client_data: ClientUpdate, old_client_data: Clients = None):
        if old_client_data:
            client = old_client_data
        else:
            client = await clients_functions.get_client_by_id(db=db, id_client=client_data.id_clients)
        
        if not client:
            return {"message": "No se encontro el cliente"}
        
        for key, value in client_data.dict(exclude_unset=True).items():
            if key == "nationality":
                value = normalize_nationality(value)
            setattr(client, key, value)
        
        db.add(client)
        db.commit()
        db.refresh(client)
        
        return client
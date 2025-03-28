from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from typing import Union

class OptionalsPurchase(BaseModel):
    id_group:str
    client_id:str
    id_activity:str
    id_optionals:str
    price:float
    discount:Union[str, float]
    place_of_purchase:str
    source:str
    payment_method:str
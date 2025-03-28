from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..dependencies import get_db
from app.service import group as group_service
from app.service import assistant as assistant_service


router = APIRouter(
    prefix="/assistants",
    tags=["assistants"],
)



@router.get('/get_assistants')
async def get_assistants(id_group:str, db:Session = Depends(get_db)):
    group_data = await group_service.get_group(db=db, id_group=id_group)

    assistant_data = await assistant_service.get_all(db=db)

    if group_data.id_assistant:
        assistants = [assistant for assistant in assistant_data if assistant.id_assistant!=group_data.id_assistant]
    else:
        assistants = assistant_data
    
    return assistants
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..dependencies import get_db
from app.service import activity as activity_service



router = APIRouter(
    prefix="/activity",
    tags=["activity"],
)



@router.get('/activity_by_id_group')
async def activity_by_id_group(id_group:str, db:Session = Depends(get_db)):
    result = await activity_service.get_filters_by_group_id(db=db, id_group=id_group)

    if not result:
        raise HTTPException(status_code=404, detail="No activities found for this group")
    return result
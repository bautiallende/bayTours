from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.schemas.circuit import StageCreate, StageRead, StageUpdate
from app.service.circuit_stages import (
    create_stage, list_stages, get_stage, update_stage, delete_stage
)
from ..dependencies import get_db

router = APIRouter(prefix="/circuits/{circuit_id}/stages", tags=["circuit_stages"])

@router.post("/", response_model=StageRead)
async def add_stage(
    circuit_id: int,
    data: StageCreate,
    db:Session = Depends(get_db)
):
    return await create_stage(db, circuit_id, data)

@router.get("/", response_model=List[StageRead])
async def read_stages(
    circuit_id: int,
    db:Session = Depends(get_db)
):
    return await list_stages(db, circuit_id)

@router.get("/{stage_id}", response_model=StageRead)
async def read_stage(
    circuit_id: int,
    stage_id: int,
    db:Session = Depends(get_db)
):
    stage = await get_stage(db, stage_id)
    if not stage:
        raise HTTPException(status_code=404, detail="Stage not found")
    return stage

@router.put("/{stage_id}", response_model=StageRead)
async def modify_stage(
    circuit_id: int,
    stage_id: int,
    data: StageUpdate,
    db:Session = Depends(get_db)
):
    updated = await update_stage(db, stage_id, data)
    if not updated:
        raise HTTPException(status_code=404, detail="Stage not found")
    return updated

@router.delete("/{stage_id}")
async def remove_stage(
    circuit_id: int,
    stage_id: int,
    db:Session = Depends(get_db)
):
    success = await delete_stage(db, stage_id)
    if not success:
        raise HTTPException(status_code=404, detail="Stage not found")
    return {"detail": "Stage deleted"}
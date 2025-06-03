from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.schemas.circuit import CircuitCreate, CircuitRead, CircuitUpdate
from app.service import circuits as CircuitService
from ..dependencies import get_db


router = APIRouter(prefix="/circuits", tags=["circuits"])


@router.post("/", response_model=CircuitRead)
async def create_circuit(
    data: CircuitCreate,
    db:Session = Depends(get_db)
):
    return await CircuitService.create(db, data)

@router.get("/", response_model=List[CircuitRead])
async def list_circuits(
    db:Session = Depends(get_db)
):
    return await CircuitService.list(db)

@router.get("/{circuit_id}", response_model=CircuitRead)
async def get_circuit(
    circuit_id: int,
    db:Session = Depends(get_db)
):
    circuit = await CircuitService.get(db, circuit_id)
    if not circuit:
        raise HTTPException(status_code=404, detail="Circuit not found")
    return circuit

@router.put("/{circuit_id}", response_model=CircuitRead)
async def update_circuit(
    circuit_id: int,
    data: CircuitUpdate,
    db:Session = Depends(get_db)
):
    circuit = await CircuitService.update(db, circuit_id, data)
    if not circuit:
        raise HTTPException(status_code=404, detail="Circuit not found")
    return circuit

@router.delete("/{circuit_id}")
async def delete_circuit(
    circuit_id: int,
    db:Session = Depends(get_db)
):
    success = await CircuitService.delete(db, circuit_id)
    if not success:
        raise HTTPException(status_code=404, detail="Circuit not found")
    return {"detail": "Circuit deleted"}
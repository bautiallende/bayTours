from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.orm import Session

from ..dependencies import get_db
from app.schemas.circuit import CircuitCreate, CircuitUpdate, CircuitRead
from app.service.circuits import (
    create_circuit,
    get_circuit,
    list_circuits,
    update_circuit,
    delete_circuit,
)

router = APIRouter(prefix="/circuits", tags=["circuits"])


@router.post("", response_model=CircuitRead, status_code=status.HTTP_201_CREATED)
async def create_circuit_endpoint(
    payload: CircuitCreate,
    db: Session = Depends(get_db),
):
    return await create_circuit(db, payload)


@router.get("", response_model=list[CircuitRead])
async def list_circuits_endpoint(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
):
    return await list_circuits(db, skip=skip, limit=limit)


@router.get("/{circuit_id}", response_model=CircuitRead)
async def get_circuit_endpoint(
    circuit_id: int,
    db: Session = Depends(get_db),
):
    return await get_circuit(db, circuit_id)


@router.patch("/{circuit_id}", response_model=CircuitRead)
async def update_circuit_endpoint(
    circuit_id: int,
    payload: CircuitUpdate,
    db: Session = Depends(get_db),
):
    return await update_circuit(db, circuit_id, payload)


@router.delete("/{circuit_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_circuit_endpoint(
    circuit_id: int,
    db: Session = Depends(get_db),
):
    await delete_circuit(db, circuit_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
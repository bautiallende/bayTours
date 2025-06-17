from typing import List

from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.orm import Session

from ..dependencies import get_db 
from app.schemas.circuit_stage import (
    CircuitStageCreate,
    CircuitStageRead,
    CircuitStageUpdate,
)
from app.service.circuit_stages import (
    create_stage,
    list_stages,
    update_stage,
    delete_stage,
)


router = APIRouter(tags=["circuit_stages"])


# ────────────────────────────────────────────────────────────────
# CREATE
# ────────────────────────────────────────────────────────────────
@router.post(
    "/circuits/{circuit_id}/stages",
    response_model=CircuitStageRead,
    status_code=status.HTTP_201_CREATED,
)
async def create_stage_endpoint(
    circuit_id: int,
    payload: CircuitStageCreate,
    db: Session = Depends(get_db),
):
    """
    Crea una nueva etapa para el circuito indicado.
    """
    return await create_stage(db, circuit_id, payload)


# ────────────────────────────────────────────────────────────────
# LIST
# ────────────────────────────────────────────────────────────────
@router.get(
    "/circuits/{circuit_id}/stages",
    response_model=List[CircuitStageRead],
)
async def list_stages_endpoint(
    circuit_id: int,
    db: Session = Depends(get_db),
):
    """
    Devuelve todas las etapas (ordenadas) de un circuito.
    """
    return await list_stages(db, circuit_id)


# ────────────────────────────────────────────────────────────────
# UPDATE
# ────────────────────────────────────────────────────────────────
@router.patch(
    "/circuit-stages/{stage_id}",
    response_model=CircuitStageRead,
)
async def update_stage_endpoint(
    stage_id: int,
    payload: CircuitStageUpdate,
    db: Session = Depends(get_db),
):
    """
    Actualiza una etapa existente.
    """
    return await update_stage(db, stage_id, payload)


# ────────────────────────────────────────────────────────────────
# DELETE
# ────────────────────────────────────────────────────────────────
@router.delete(
    "/circuit-stages/{stage_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_stage_endpoint(
    stage_id: int,
    db: Session = Depends(get_db),
):
    """
    Elimina una etapa y sus transportes asociados.
    """
    await delete_stage(db, stage_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)








# @router.post("/", response_model=StageRead)
# async def add_stage(
#     circuit_id: int,
#     data: StageCreate,
#     db:Session = Depends(get_db)
# ):
#     return await create_stage(db, circuit_id, data)

# @router.get("/", response_model=List[StageRead])
# async def read_stages(
#     circuit_id: int,
#     db:Session = Depends(get_db)
# ):
#     return await list_stages(db, circuit_id)

# @router.get("/{stage_id}", response_model=StageRead)
# async def read_stage(
#     circuit_id: int,
#     stage_id: int,
#     db:Session = Depends(get_db)
# ):
#     stage = await get_stage(db, stage_id)
#     if not stage:
#         raise HTTPException(status_code=404, detail="Stage not found")
#     return stage

# @router.put("/{stage_id}", response_model=StageRead)
# async def modify_stage(
#     circuit_id: int,
#     stage_id: int,
#     data: StageUpdate,
#     db:Session = Depends(get_db)
# ):
#     updated = await update_stage(db, stage_id, data)
#     if not updated:
#         raise HTTPException(status_code=404, detail="Stage not found")
#     return updated

# @router.delete("/{stage_id}")
# async def remove_stage(
#     circuit_id: int,
#     stage_id: int,
#     db:Session = Depends(get_db)
# ):
#     success = await delete_stage(db, stage_id)
#     if not success:
#         raise HTTPException(status_code=404, detail="Stage not found")
#     return {"detail": "Stage deleted"}
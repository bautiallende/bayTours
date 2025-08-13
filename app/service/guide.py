from sqlalchemy.ext.asyncio import AsyncSession
from app.schemas.guides import GuideUpdate, GuideCreate
from .guides_handler import guide_handler
from app.crud import guides as guides_functions




async def create(db: AsyncSession, guides_data: GuideCreate):
    handler = guide_handler.get('new_guide')
    response = await handler(db, guides_data)
    return response



async def update(db: AsyncSession, id_guide: int, guide_data: GuideUpdate):
    handler = guide_handler.get('update_guide')
    response = await handler( db=db, id_guide=id_guide, guide_data=guide_data)
    return response


async def get_guide_group(db: AsyncSession, id_group:str):
    result = await guides_functions.get_guide_group(id_group=id_group, db=db)
    return result


async def get_guide(db:AsyncSession, id_guide:str):
    result = await guides_functions.get_guide(db=db, id_guide=id_guide)
    return result


# ────────────────────────────────────────────────────────────────
# GET ficha completa (info + availability + evaluations)
# ────────────────────────────────────────────────────────────────
async def get_full(db: AsyncSession, id_guide: int):
    return await guides_functions.get_guide(db=db, id_guide=id_guide)


# ────────────────────────────────────────────────────────────────
# LIST todos los guías
# ────────────────────────────────────────────────────────────────
async def list_all(db: AsyncSession):
    return await guides_functions.get_all_guides(db=db)
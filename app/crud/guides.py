from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.schemas.guides import GuideBase, Guide
from app.models.guides import Guides
from app.models.group import Group




async def create(db:AsyncSession, guides_data:GuideBase):
    new_guide = Guides(**guides_data.dict())
    db.add(new_guide)
    db.commit()
    db.refresh(new_guide)
    return new_guide



async def update(db:AsyncSession, guide_data:Guide):

    result = db.execute(select(Guides).where(guide_data.id_guide == Guides.id_guide))
    guide = result.scalar_one_or_none()

    if not guide:
        return {"detail": "Guide not found"}
    
    if guide_data.id_guide:
        guide.id_guide = guide_data.id_guide
    if guide_data.name:
        guide.name = guide_data.name
    if guide_data.surname:
        guide.surname = guide_data.surname
    if guide_data.phone:
        guide.phone = guide_data.phone
    if guide_data.birth_date:
        guide.birth_date = guide_data.birth_date
    if guide_data.mail:
        guide.mail = guide_data.mail
    if guide_data.passaport:
        guide.passaport = guide_data.passaport
    if isinstance(guide_data.active, bool):
        guide.active = guide_data.active
    if guide_data.comment:
        guide.comment = guide_data.comment

    db.commit()
    db.refresh(guide)
    return guide
    


async def get_guide_group(id_group:str, db:AsyncSession):
    result = db.execute(select(Guides).join(Group, Group.id_guide == Guides.id_guide).where(Group.id_group == id_group))
    guide = result.scalar_one_or_none()
    return guide 



async def get_guide(db:AsyncSession, id_guide:str):
    result = db.execute(select(Guides).where(Guides.id_guide == id_guide))
    guide = result.scalar_one_or_none()
    return guide
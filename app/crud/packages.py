from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import and_
from app.models.packages import Packages


async def get_packages(db:AsyncSession, id_circuit:str, packages:int ):
    result = db.execute(select(Packages).where(and_(Packages.id_circuit == id_circuit, Packages.package_number == packages)))
    packages = result.scalars().all()
    return packages
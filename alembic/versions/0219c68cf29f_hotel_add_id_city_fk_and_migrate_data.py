"""hotel: add id_city fk and migrate data

Revision ID: 0219c68cf29f
Revises: 970354b8c1a7
Create Date: 2025-07-22 11:27:18.805645

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '0219c68cf29f'
down_revision: Union[str, None] = '970354b8c1a7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Añadir columna id_city (nullable) + índice
    op.add_column("hotel", sa.Column("id_city", sa.Integer(), nullable=True))
    op.create_index("ix_hotel_id_city", "hotel", ["id_city"])

    



def downgrade() -> None:
    op.add_column("hotel", sa.Column("city_name", sa.String(255), nullable=True))




    op.drop_index("ix_hotel_id_city", table_name="hotel")
    
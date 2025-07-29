"""hotel

Revision ID: cf539d7af912
Revises: 0219c68cf29f
Create Date: 2025-07-22 11:49:10.358971

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'cf539d7af912'
down_revision: Union[str, None] = '0219c68cf29f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass

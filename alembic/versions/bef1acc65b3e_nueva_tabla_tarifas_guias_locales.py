"""nueva tabla tarifas guias locales

Revision ID: bef1acc65b3e
Revises: 6fc3d991c071
Create Date: 2025-08-04 13:16:57.718126

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql

# revision identifiers, used by Alembic.
revision: str = 'bef1acc65b3e'
down_revision: Union[str, None] = '6fc3d991c071'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass

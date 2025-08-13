"""nuevos canbios para los guias

Revision ID: 64ee750d8bee
Revises: 621eb75ff3e9
Create Date: 2025-08-07 11:51:10.988667

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql

# revision identifiers, used by Alembic.
revision: str = '64ee750d8bee'
down_revision: Union[str, None] = '621eb75ff3e9'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass

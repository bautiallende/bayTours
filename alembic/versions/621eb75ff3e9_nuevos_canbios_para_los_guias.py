"""nuevos canbios para los guias

Revision ID: 621eb75ff3e9
Revises: 06e2bdc3a730
Create Date: 2025-08-07 11:48:14.215043

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql

# revision identifiers, used by Alembic.
revision: str = '621eb75ff3e9'
down_revision: Union[str, None] = '06e2bdc3a730'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass

"""cambio de nombre de city a city_id en local_guides

Revision ID: ea74f3cda0ec
Revises: f1b86d88e471
Create Date: 2025-08-01 11:17:00.285326

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql

# revision identifiers, used by Alembic.
revision: str = 'ea74f3cda0ec'
down_revision: Union[str, None] = 'f1b86d88e471'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass

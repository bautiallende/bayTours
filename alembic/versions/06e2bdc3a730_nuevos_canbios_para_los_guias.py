"""nuevos canbios para los guias

Revision ID: 06e2bdc3a730
Revises: 3c98f7edecfb
Create Date: 2025-08-07 11:44:44.159464

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql

# revision identifiers, used by Alembic.
revision: str = '06e2bdc3a730'
down_revision: Union[str, None] = '3c98f7edecfb'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
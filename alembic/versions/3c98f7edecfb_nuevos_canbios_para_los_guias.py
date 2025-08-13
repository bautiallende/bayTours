"""nuevos canbios para los guias

Revision ID: 3c98f7edecfb
Revises: 60746c1d62d9
Create Date: 2025-08-07 11:39:50.089497

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql

# revision identifiers, used by Alembic.
revision: str = '3c98f7edecfb'
down_revision: Union[str, None] = '60746c1d62d9'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass

def downgrade() -> None:
    pass
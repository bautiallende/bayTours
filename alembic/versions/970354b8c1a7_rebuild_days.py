"""rebuild days 

Revision ID: 970354b8c1a7
Revises: 681e50880101
Create Date: 2025-07-22 09:21:47.797246

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '970354b8c1a7'
down_revision: Union[str, None] = '681e50880101'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass

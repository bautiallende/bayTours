"""hotel

Revision ID: eab8ec1f644c
Revises: d713d128b6cb
Create Date: 2025-07-22 11:55:05.801158

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'eab8ec1f644c'
down_revision: Union[str, None] = 'd713d128b6cb'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass

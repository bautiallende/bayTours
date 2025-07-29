"""hotel sin col

Revision ID: 2b231f1ad546
Revises: eab8ec1f644c
Create Date: 2025-07-22 11:58:08.227573

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '2b231f1ad546'
down_revision: Union[str, None] = 'eab8ec1f644c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass

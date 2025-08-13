"""add guides and guide availability

Revision ID: 60746c1d62d9
Revises: c6f814ca8156
Create Date: 2025-08-07 11:37:09.932180

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '60746c1d62d9'
down_revision: Union[str, None] = 'c6f814ca8156'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    pass


def downgrade():
    pass
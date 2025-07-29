"""hotel

Revision ID: d713d128b6cb
Revises: cf539d7af912
Create Date: 2025-07-22 11:54:50.752062

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'd713d128b6cb'
down_revision: Union[str, None] = 'cf539d7af912'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass

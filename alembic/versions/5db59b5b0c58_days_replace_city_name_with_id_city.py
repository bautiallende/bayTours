"""days: replace city name with id_city

Revision ID: 5db59b5b0c58
Revises: 4810c293845c
Create Date: 2025-07-21 12:24:58.326786

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '5db59b5b0c58'
down_revision: Union[str, None] = '4810c293845c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass

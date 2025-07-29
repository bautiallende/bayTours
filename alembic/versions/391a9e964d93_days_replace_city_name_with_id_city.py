"""days: replace city name with id_city

Revision ID: 391a9e964d93
Revises: 5db59b5b0c58
Create Date: 2025-07-22 09:05:04.291867

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '391a9e964d93'
down_revision: Union[str, None] = '5db59b5b0c58'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass

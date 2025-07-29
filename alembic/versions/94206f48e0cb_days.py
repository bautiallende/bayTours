"""days

Revision ID: 94206f48e0cb
Revises: 391a9e964d93
Create Date: 2025-07-22 09:07:43.975368

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '94206f48e0cb'
down_revision: Union[str, None] = '391a9e964d93'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass

"""nuevatabla 

Revision ID: 6fc3d991c071
Revises: 7fb7c8c66532
Create Date: 2025-08-04 13:00:10.187914

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '6fc3d991c071'
down_revision: Union[str, None] = '7fb7c8c66532'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass

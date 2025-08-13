"""modificaciones tablas de guias y disponibilidad

Revision ID: c6f814ca8156
Revises: b205b75dec48
Create Date: 2025-08-07 11:35:08.891496

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c6f814ca8156'
down_revision: Union[str, None] = 'b205b75dec48'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass

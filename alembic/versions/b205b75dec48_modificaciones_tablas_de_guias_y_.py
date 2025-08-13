"""modificaciones tablas de guias y disponibilidad

Revision ID: b205b75dec48
Revises: 3e22241852bc
Create Date: 2025-08-07 11:34:01.065349

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b205b75dec48'
down_revision: Union[str, None] = '3e22241852bc'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass

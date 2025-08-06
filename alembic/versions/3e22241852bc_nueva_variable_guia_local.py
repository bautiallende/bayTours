"""nueva variable guia local

Revision ID: 3e22241852bc
Revises: dd0b0f492c92
Create Date: 2025-08-05 12:46:38.516652

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '3e22241852bc'
down_revision: Union[str, None] = 'dd0b0f492c92'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass

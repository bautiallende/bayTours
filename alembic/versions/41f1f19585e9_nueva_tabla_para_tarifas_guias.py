"""nueva tabla para tarifas guias 

Revision ID: 41f1f19585e9
Revises: ea74f3cda0ec
Create Date: 2025-08-04 12:56:53.663319

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '41f1f19585e9'
down_revision: Union[str, None] = 'ea74f3cda0ec'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass

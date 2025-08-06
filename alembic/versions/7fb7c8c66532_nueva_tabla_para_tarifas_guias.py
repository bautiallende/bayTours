"""nueva tabla para tarifas guias 

Revision ID: 7fb7c8c66532
Revises: 41f1f19585e9
Create Date: 2025-08-04 12:58:19.802226

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '7fb7c8c66532'
down_revision: Union[str, None] = '41f1f19585e9'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass

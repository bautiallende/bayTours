"""optionals: add id_city fk

Revision ID: a5ab9007a857
Revises: e937606ac453
Create Date: 2025-08-05 10:11:25.707134

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a5ab9007a857'
down_revision: Union[str, None] = 'e937606ac453'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
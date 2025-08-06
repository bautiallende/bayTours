"""optionals

Revision ID: dd0b0f492c92
Revises: a5ab9007a857
Create Date: 2025-08-05 10:22:19.829900

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'dd0b0f492c92'
down_revision: Union[str, None] = 'a5ab9007a857'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass

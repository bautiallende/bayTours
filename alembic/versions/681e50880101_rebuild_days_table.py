"""rebuild days table

Revision ID: 681e50880101
Revises: 94206f48e0cb
Create Date: 2025-07-22 09:20:35.979660

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '681e50880101'
down_revision: Union[str, None] = '94206f48e0cb'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass
   

def downgrade() -> None:
    pass

"""add group_city_permits table

Revision ID: fce8baaec9d6
Revises: f981964e4a72
Create Date: 2025-06-24 10:14:08.592080

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'fce8baaec9d6'
down_revision: Union[str, None] = 'f981964e4a72'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('group_city_permits',
    sa.Column('id_permit', sa.String(length=255), nullable=False),
    sa.Column('id_group', sa.String(length=255), nullable=False),
    sa.Column('id_city', sa.Integer(), nullable=False),
    sa.Column('id_transport', sa.String(length=255), nullable=False),
    sa.Column('valid_from', sa.Date(), nullable=False),
    sa.Column('valid_to', sa.Date(), nullable=False),
    sa.Column('status', sa.Enum('pending', 'submitted', 'approved', 'rejected', name='permit_status_enum'), nullable=False),
    sa.Column('permit_number', sa.String(length=255), nullable=True),
    sa.Column('managed_by', sa.String(length=255), nullable=True),
    sa.Column('provider', sa.String(length=255), nullable=True),
    sa.Column('price', sa.Float(), nullable=True),
    sa.Column('payed_with', sa.String(length=255), nullable=True),
    sa.Column('payment_date', sa.Date(), nullable=True),
    sa.Column('comments', sa.TEXT(), nullable=True),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.Column('updated_by', sa.String(length=255), nullable=True),
    sa.ForeignKeyConstraint(['id_city'], ['cities.id'], ),
    sa.ForeignKeyConstraint(['id_group'], ['group.id_group'], ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['id_transport'], ['transport.id_transport'], ),
    sa.PrimaryKeyConstraint('id_permit'),
    sa.UniqueConstraint('id_group', 'id_city', name='uq_group_city_permit')
    )
    op.create_index(op.f('ix_group_city_permits_id_city'), 'group_city_permits', ['id_city'], unique=False)
    op.create_index(op.f('ix_group_city_permits_id_group'), 'group_city_permits', ['id_group'], unique=False)
    op.create_index(op.f('ix_group_city_permits_id_transport'), 'group_city_permits', ['id_transport'], unique=False)
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_index(op.f('ix_group_city_permits_id_transport'), table_name='group_city_permits')
    op.drop_index(op.f('ix_group_city_permits_id_group'), table_name='group_city_permits')
    op.drop_index(op.f('ix_group_city_permits_id_city'), table_name='group_city_permits')
    op.drop_table('group_city_permits')
    # ### end Alembic commands ###

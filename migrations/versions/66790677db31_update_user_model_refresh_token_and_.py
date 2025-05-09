"""Update User model: refresh_token and expires_at

Revision ID: 66790677db31
Revises: e7dba4d02736
Create Date: 2025-03-06 22:36:36.479250

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '66790677db31'
down_revision = 'e7dba4d02736'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('user', sa.Column('refresh_token', sa.String(length=512), nullable=True))
    op.add_column('user', sa.Column('expires_at', sa.DateTime(), nullable=True))
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('user', 'expires_at')
    op.drop_column('user', 'refresh_token')
    # ### end Alembic commands ###

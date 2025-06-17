"""Alembic migration environment."""

from logging.config import fileConfig
import os
from sqlalchemy import engine_from_config, pool
from alembic import context

# ───────────────────────────────────────────────────────────────
# 1️⃣  Carga la configuración de logging desde alembic.ini
# ───────────────────────────────────────────────────────────────
config = context.config
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# ───────────────────────────────────────────────────────────────
# 2️⃣  Importa tu Base global (y, al hacerlo, TODO tu paquete de modelos)
#     Ajusta la ruta si tu módulo está en otro sitio.
# ───────────────────────────────────────────────────────────────
from app.database import Base           # ← ya existe en tu proyecto
import app.models                       # ← importa (sub)módulos para que
                                        #    se registren las tablas

# target_metadata permite el autogenerate
target_metadata = Base.metadata

# (Opcional) 3️⃣  Convención de nombres coherente para PK/FK/IX
from sqlalchemy import MetaData

NAMING_CONVENTION = {
    "ix": "ix_%(column_0_label)s",
    "uq": "uq_%(table_name)s_%(column_0_name)s",
    "ck": "ck_%(table_name)s_%(constraint_name)s",
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
    "pk": "pk_%(table_name)s",
}
target_metadata.naming_convention = NAMING_CONVENTION

# ───────────────────────────────────────────────────────────────
# 4️⃣  Obtén la URL desde la variable de entorno y pásala a Alembic
# ───────────────────────────────────────────────────────────────
def get_url() -> str:
    return os.getenv(
        "DATABASE_URL",
        "mysql+mysqlconnector://root:1234@localhost/turismo_db_dev",  # valor por defecto
    )

config.set_main_option("sqlalchemy.url", get_url())

# ───────────────────────────────────────────────────────────────
# 5️⃣  Funciones estándar offline / online (no cambian salvo el target_metadata)
# ───────────────────────────────────────────────────────────────
def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode."""
    context.configure(
        url=get_url(),
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode."""
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,          # detecta cambios de tipo (opcional)
        )
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
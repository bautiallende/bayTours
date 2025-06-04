# bayTours

This project uses **Alembic** to manage database migrations. The
configuration lives in the `alembic/` directory.

## Running migrations

1. Set the environment variable `DATABASE_URL` with your database
   connection string. For example:
   ```bash
   export DATABASE_URL=mysql+mysqlconnector://root:1234@localhost/turismo_db
   ```
2. Generate a new migration after updating your models:
   ```bash
   alembic revision --autogenerate -m "describe your change"
   ```
3. Apply pending migrations to the database:
   ```bash
   alembic upgrade head
   ```

The first migration file can be found under `alembic/versions/`.

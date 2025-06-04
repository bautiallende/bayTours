# bayTours

BayTours is a FastAPI service that powers the back‑office for the BayTours agency. It exposes REST endpoints to manage groups, hotels, guides, transports and many other entities. A companion React interface lives under `frontend_2.0/baytours-react`.

## Requirements

- Python 3.11+
- Node.js (for the optional React frontend)
- A MySQL instance for the `DATABASE_URL` connection string

## Setup

1. Create a virtual environment and install dependencies:
   ```bash
   python -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```
2. Copy `credentials.json.example` to `credentials.json` and update the values if Google credentials are required.
3. Export your database URL:
   ```bash
   export DATABASE_URL=mysql+mysqlconnector://user:password@localhost/turismo_db
   ```

## Running the API

Start the FastAPI server with Uvicorn:
```bash
uvicorn app.main:app --reload
```
The API will be available at `http://localhost:8000/`.

## Running the React frontend (optional)

```bash
cd frontend_2.0/baytours-react
npm install
npm start
```
This launches the development server at `http://localhost:3000`.

## Database migrations

This project uses **Alembic** to manage database migrations. The configuration lives in the `alembic/` directory.

Generate and apply migrations as follows:
```bash
alembic revision --autogenerate -m "describe your change"
alembic upgrade head
```
Migration files are stored under `alembic/versions/`.

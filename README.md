# NutriSync ⚡

> **Intelligent Human Telemetry, Sports Science Calibration & Interactive Workout Engine**

NutriSync is a high-performance, full-stack fitness and nutrition synchronization platform built with **React 19**, **FastAPI**, and **PostgreSQL**.

---

## 🏗️ Architecture Overview

```
NutriSync/
├── frontend/             # React 19 + TypeScript + Vite + Tailwind v4
│   ├── src/
│   │   ├── pages/        # Auth, Onboarding Wizard, Dashboard, Focus Mode Workout HUD, History
│   │   ├── services/     # API Client & typed endpoints
│   │   └── index.css     # Luxury dark forest design system (#132720, #cbed3e)
├── backend/              # FastAPI Python application
│   ├── app/
│   │   ├── api/          # REST Routes (/auth, /profile, /exercises, /workouts)
│   │   ├── models/       # SQLAlchemy 2.0 ORM models with JSONB sets
│   │   ├── schemas/      # Pydantic v2 validation models & computed BMI
│   │   └── db/           # Database sessions & exercise seeder
│   └── alembic/          # Database migrations
├── docs/                 # Architecture, Biometrics, and Implementation Guides
└── docker-compose.yml    # Containerized PostgreSQL 15 database (Port 5433)
```

---

## 🚀 Quick Start Guide (For Collaborators)

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Node.js](https://nodejs.org/) (v20+ recommended)
- [Python](https://www.python.org/) (v3.11 - v3.13)
- [Git](https://git-scm.com/)

---

### 1. Clone the Repository
```bash
git clone <repository-url>
cd NutriSync
```

---

### 2. Start PostgreSQL Database
```bash
docker compose up -d
```
> PostgreSQL will run on port `5433` (DB Name: `nutrisync_db`, User: `postgres`, Password: `postgrespassword`).

---

### 3. Backend Setup (FastAPI)

```bash
# Navigate to backend
cd backend

# Create and activate virtual environment
python -m venv venv

# On Windows:
venv\Scripts\activate
# On macOS/Linux:
# source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run database migrations
alembic upgrade head

# Seed master exercise catalog (25 movements)
python -m app.db.seed_exercises

# Start the development server
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
- **Backend API Docs (Swagger):** `http://127.0.0.1:8000/docs`
- **Health Check:** `http://127.0.0.1:8000/health`

---

### 4. Frontend Setup (React + Vite)

```bash
# In a new terminal, navigate to frontend
cd frontend

# Install Node dependencies
npm install

# Start Vite dev server
npm run dev
```
- **Frontend App:** `http://localhost:8443` (or `http://localhost:5173`)

---

### ⚡ One-Click Startup (Windows)
If on Windows, you can also simply double-click `start.bat` in the root folder to launch all 3 services automatically.

---

## 🧪 Running Diagnostic Tests

To verify backend endpoints and database relations:
```bash
# In the backend directory with venv activated:
python -m app.db.inspect_db
```

---

## 📖 Technical Documentation

For in-depth architectural guides and formulas, see the [`docs/`](./docs) folder:
- [Current Implementation Status & Technical Guide](./docs/current_implementation_status.md)
- [Biometrics & Onboarding Architecture Guide](./docs/biometrics_and_onboarding_guide.md)
- [Fitness & Workout Engine Architecture Guide](./docs/fitness_and_workout_engine_guide.md)
- [Why Docker Guide](./docs/why_docker.md)

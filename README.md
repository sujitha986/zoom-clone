# Zoom Clone Assessment Build

This repository contains a backend-first Zoom-style meeting app for a 1-day SDE internship assessment.

## Architecture

- `backend/`: FastAPI API, SQLAlchemy models, SQLite database, meeting/user/participant routes.
- `frontend/`: Next.js SPA-style UI with dashboard, instant meeting, join, schedule, and meeting room screens.

## Local run

Backend:

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Open:

- Frontend: http://localhost:3000
- Backend docs: http://localhost:8000/docs

## Required flows implemented

- Landing dashboard
- Instant meeting creation
- Join meeting by meeting ID/code
- Schedule meetings
- Zoom-like dashboard and meeting room UI

## Deployment

- Frontend: Vercel. Set `NEXT_PUBLIC_API_BASE_URL` to the deployed backend URL.
- Backend: Render Python web service.
  - Build command: `pip install -r requirements.txt`
  - Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
  - Environment variable: `FRONTEND_ORIGINS=https://your-vercel-app.vercel.app`

SQLite is used because the assessment requires it. For a production app, the same schema should be migrated to Postgres so hosted deployments do not depend on ephemeral local disk.

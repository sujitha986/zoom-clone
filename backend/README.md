# Zoom Clone Backend

FastAPI + SQLite backend for the meeting workflows required by the assessment.

## Run locally

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

API docs: http://localhost:8000/docs

## Core endpoints

- `POST /meetings/instant`
- `POST /meetings/scheduled`
- `GET /meetings`
- `GET /meetings/{meeting_id}`
- `GET /meetings/code/{meeting_code}`
- `POST /meetings/join`
- `POST /meetings/{meeting_id}/end`
- `POST /participants/{participant_id}/leave`

## Schema rationale

- `users` stores host identity.
- `meetings` stores instant and scheduled meeting records.
- `meeting_settings` keeps room behavior separate from core meeting data.
- `participants` stores attendance history for every join.

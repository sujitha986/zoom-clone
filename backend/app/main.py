import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import Base, engine
from .routers import meetings, participants, users

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Zoom Clone API",
    description="Backend API for a 1-day Zoom-style meeting management assessment.",
    version="1.0.0",
)

frontend_origins = [
    origin.strip()
    for origin in os.getenv("FRONTEND_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000").split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=frontend_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router)
app.include_router(meetings.router)
app.include_router(participants.router)


@app.get("/health")
def health_check():
    return {"status": "ok"}

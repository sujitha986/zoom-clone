from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import crud, schemas
from ..database import get_db

router = APIRouter(prefix="/meetings", tags=["meetings"])


@router.post("/instant", response_model=schemas.MeetingRead, status_code=201)
def create_instant_meeting(payload: schemas.InstantMeetingCreate, db: Session = Depends(get_db)):
    return crud.create_instant_meeting(db, payload)


@router.post("/scheduled", response_model=schemas.MeetingRead, status_code=201)
def create_scheduled_meeting(payload: schemas.ScheduledMeetingCreate, db: Session = Depends(get_db)):
    if payload.scheduled_end <= payload.scheduled_start:
        raise HTTPException(status_code=400, detail="scheduled_end must be after scheduled_start")
    return crud.create_scheduled_meeting(db, payload)


@router.get("", response_model=list[schemas.MeetingRead])
def list_meetings(db: Session = Depends(get_db)):
    return crud.list_meetings(db)


@router.get("/{meeting_id}", response_model=schemas.MeetingRead)
def get_meeting(meeting_id: int, db: Session = Depends(get_db)):
    meeting = crud.get_meeting(db, meeting_id)
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    return meeting


@router.get("/code/{meeting_code}", response_model=schemas.MeetingRead)
def get_meeting_by_code(meeting_code: str, db: Session = Depends(get_db)):
    meeting = crud.get_meeting_by_code(db, meeting_code)
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    return meeting


@router.patch("/{meeting_id}", response_model=schemas.MeetingRead)
def update_meeting(meeting_id: int, payload: schemas.MeetingUpdate, db: Session = Depends(get_db)):
    meeting = crud.get_meeting(db, meeting_id)
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    if payload.scheduled_start and payload.scheduled_end and payload.scheduled_end <= payload.scheduled_start:
        raise HTTPException(status_code=400, detail="scheduled_end must be after scheduled_start")
    return crud.update_meeting(db, meeting, payload)


@router.post("/join", response_model=schemas.JoinMeetingResponse)
def join_meeting(payload: schemas.ParticipantCreate, db: Session = Depends(get_db)):
    meeting, participant, error = crud.join_meeting(db, payload)
    if error:
        status_code = 404 if error == "Meeting not found" else 400
        raise HTTPException(status_code=status_code, detail=error)
    return {"meeting": meeting, "participant": participant}


@router.post("/{meeting_id}/end", response_model=schemas.MeetingRead)
def end_meeting(meeting_id: int, db: Session = Depends(get_db)):
    meeting = crud.get_meeting(db, meeting_id)
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    return crud.end_meeting(db, meeting)


@router.get("/{meeting_id}/participants", response_model=list[schemas.ParticipantRead])
def list_participants(meeting_id: int, db: Session = Depends(get_db)):
    meeting = crud.get_meeting(db, meeting_id)
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    return meeting.participants

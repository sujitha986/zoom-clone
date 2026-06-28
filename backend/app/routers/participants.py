from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import crud, models, schemas
from ..database import get_db

router = APIRouter(prefix="/participants", tags=["participants"])


@router.post("/{participant_id}/leave", response_model=schemas.ParticipantRead)
def leave_meeting(participant_id: int, db: Session = Depends(get_db)):
    participant = db.query(models.Participant).filter(models.Participant.id == participant_id).first()
    if not participant:
        raise HTTPException(status_code=404, detail="Participant not found")
    return crud.leave_meeting(db, participant)

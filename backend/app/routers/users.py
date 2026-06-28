from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from .. import crud, schemas
from ..database import get_db

router = APIRouter(prefix="/users", tags=["users"])


@router.post("", response_model=schemas.UserRead, status_code=201)
def create_user(payload: schemas.UserCreate, db: Session = Depends(get_db)):
    user = crud.get_or_create_user(db, payload.name, str(payload.email))
    db.commit()
    db.refresh(user)
    return user

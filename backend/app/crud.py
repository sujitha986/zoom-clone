import random
import string

from sqlalchemy.orm import Session, selectinload

from . import models, schemas


def get_or_create_user(db: Session, name: str, email: str) -> models.User:
    user = db.query(models.User).filter(models.User.email == email).first()
    if user:
        if user.name != name:
            user.name = name
        return user

    user = models.User(name=name, email=email)
    db.add(user)
    db.flush()
    return user


def generate_meeting_code(db: Session) -> str:
    while True:
        chunks = [
            "".join(random.choices(string.digits, k=3)),
            "".join(random.choices(string.digits, k=4)),
            "".join(random.choices(string.digits, k=3)),
        ]
        code = " ".join(chunks)
        exists = db.query(models.Meeting).filter(models.Meeting.meeting_code == code).first()
        if not exists:
            return code


def generate_passcode(length: int = 6) -> str:
    alphabet = string.ascii_uppercase + string.digits
    return "".join(random.choices(alphabet, k=length))


def create_meeting_settings(
    db: Session, meeting: models.Meeting, settings: schemas.MeetingSettingsBase
) -> models.MeetingSettings:
    meeting_settings = models.MeetingSettings(
        meeting=meeting,
        waiting_room_enabled=settings.waiting_room_enabled,
        mute_on_join=settings.mute_on_join,
        camera_on_join=settings.camera_on_join,
    )
    db.add(meeting_settings)
    return meeting_settings


def create_host_participant(db: Session, meeting: models.Meeting, host: models.User) -> models.Participant:
    participant = models.Participant(
        meeting=meeting,
        user_name=host.name,
        user_email=host.email,
        role=models.ParticipantRole.host,
    )
    db.add(participant)
    return participant


def create_instant_meeting(db: Session, data: schemas.InstantMeetingCreate) -> models.Meeting:
    host = get_or_create_user(db, data.host_name, str(data.host_email))
    meeting = models.Meeting(
        title=data.title,
        meeting_code=generate_meeting_code(db),
        passcode=generate_passcode(),
        host=host,
        meeting_type=models.MeetingType.instant,
        status=models.MeetingStatus.active,
    )
    db.add(meeting)
    db.flush()
    create_meeting_settings(db, meeting, data.settings)
    create_host_participant(db, meeting, host)
    db.commit()
    db.refresh(meeting)
    return get_meeting(db, meeting.id)


def create_scheduled_meeting(db: Session, data: schemas.ScheduledMeetingCreate) -> models.Meeting:
    host = get_or_create_user(db, data.host_name, str(data.host_email))
    meeting = models.Meeting(
        title=data.title,
        meeting_code=generate_meeting_code(db),
        passcode=data.passcode or generate_passcode(),
        agenda=data.agenda,
        host=host,
        meeting_type=models.MeetingType.scheduled,
        status=models.MeetingStatus.scheduled,
        scheduled_start=data.scheduled_start,
        scheduled_end=data.scheduled_end,
    )
    db.add(meeting)
    db.flush()
    create_meeting_settings(db, meeting, data.settings)
    db.commit()
    db.refresh(meeting)
    return get_meeting(db, meeting.id)


def get_meeting(db: Session, meeting_id: int) -> models.Meeting | None:
    return (
        db.query(models.Meeting)
        .options(
            selectinload(models.Meeting.host),
            selectinload(models.Meeting.settings),
            selectinload(models.Meeting.participants),
        )
        .filter(models.Meeting.id == meeting_id)
        .first()
    )


def get_meeting_by_code(db: Session, meeting_code: str) -> models.Meeting | None:
    normalized = normalize_meeting_code(meeting_code)
    return (
        db.query(models.Meeting)
        .options(
            selectinload(models.Meeting.host),
            selectinload(models.Meeting.settings),
            selectinload(models.Meeting.participants),
        )
        .filter(models.Meeting.meeting_code == normalized)
        .first()
    )


def list_meetings(db: Session) -> list[models.Meeting]:
    return (
        db.query(models.Meeting)
        .options(
            selectinload(models.Meeting.host),
            selectinload(models.Meeting.settings),
            selectinload(models.Meeting.participants),
        )
        .order_by(models.Meeting.created_at.desc())
        .all()
    )


def update_meeting(db: Session, meeting: models.Meeting, data: schemas.MeetingUpdate) -> models.Meeting:
    payload = data.model_dump(exclude_unset=True)
    settings = payload.pop("settings", None)
    for key, value in payload.items():
        setattr(meeting, key, value)

    if settings:
        meeting.settings.waiting_room_enabled = settings["waiting_room_enabled"]
        meeting.settings.mute_on_join = settings["mute_on_join"]
        meeting.settings.camera_on_join = settings["camera_on_join"]

    db.commit()
    db.refresh(meeting)
    return get_meeting(db, meeting.id)


def join_meeting(db: Session, data: schemas.ParticipantCreate) -> tuple[models.Meeting | None, models.Participant | None, str | None]:
    meeting = get_meeting_by_code(db, data.meeting_code)
    if not meeting:
        return None, None, "Meeting not found"
    if meeting.status == models.MeetingStatus.ended:
        return meeting, None, "Meeting has ended"
    if meeting.passcode and data.passcode != meeting.passcode:
        return meeting, None, "Invalid passcode"

    if meeting.status == models.MeetingStatus.scheduled:
        meeting.status = models.MeetingStatus.active

    participant = models.Participant(
        meeting=meeting,
        user_name=data.user_name,
        user_email=str(data.user_email) if data.user_email else None,
        role=models.ParticipantRole.guest,
    )
    db.add(participant)
    db.commit()
    db.refresh(participant)
    return get_meeting(db, meeting.id), participant, None


def end_meeting(db: Session, meeting: models.Meeting) -> models.Meeting:
    meeting.status = models.MeetingStatus.ended
    for participant in meeting.participants:
        if participant.left_at is None:
            participant.left_at = models.utc_now()
    db.commit()
    db.refresh(meeting)
    return get_meeting(db, meeting.id)


def leave_meeting(db: Session, participant: models.Participant) -> models.Participant:
    participant.left_at = models.utc_now()
    db.commit()
    db.refresh(participant)
    return participant


def normalize_meeting_code(meeting_code: str) -> str:
    digits = "".join(char for char in meeting_code if char.isdigit())
    if len(digits) == 10:
        return f"{digits[:3]} {digits[3:7]} {digits[7:]}"
    return meeting_code.strip()

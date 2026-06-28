from datetime import datetime

from pydantic import BaseModel, EmailStr, Field

from .models import MeetingStatus, MeetingType, ParticipantRole


class UserCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    email: EmailStr


class UserRead(BaseModel):
    id: int
    name: str
    email: EmailStr
    created_at: datetime

    model_config = {"from_attributes": True}


class MeetingSettingsBase(BaseModel):
    waiting_room_enabled: bool = True
    mute_on_join: bool = True
    camera_on_join: bool = False


class MeetingSettingsRead(MeetingSettingsBase):
    id: int
    meeting_id: int

    model_config = {"from_attributes": True}


class InstantMeetingCreate(BaseModel):
    host_name: str = Field(default="Demo Host", min_length=1, max_length=120)
    host_email: EmailStr = Field(default="host@example.com")
    title: str = Field(default="Instant Meeting", min_length=1, max_length=160)
    settings: MeetingSettingsBase = Field(default_factory=MeetingSettingsBase)


class ScheduledMeetingCreate(BaseModel):
    host_name: str = Field(default="Demo Host", min_length=1, max_length=120)
    host_email: EmailStr = Field(default="host@example.com")
    title: str = Field(min_length=1, max_length=160)
    agenda: str | None = Field(default=None, max_length=2000)
    scheduled_start: datetime
    scheduled_end: datetime
    passcode: str | None = Field(default=None, max_length=12)
    settings: MeetingSettingsBase = Field(default_factory=MeetingSettingsBase)


class MeetingUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=160)
    agenda: str | None = Field(default=None, max_length=2000)
    scheduled_start: datetime | None = None
    scheduled_end: datetime | None = None
    passcode: str | None = Field(default=None, max_length=12)
    settings: MeetingSettingsBase | None = None


class ParticipantCreate(BaseModel):
    meeting_code: str = Field(min_length=6, max_length=20)
    user_name: str = Field(min_length=1, max_length=120)
    user_email: EmailStr | None = None
    passcode: str | None = Field(default=None, max_length=12)


class ParticipantRead(BaseModel):
    id: int
    meeting_id: int
    user_name: str
    user_email: EmailStr | None
    role: ParticipantRole
    joined_at: datetime
    left_at: datetime | None

    model_config = {"from_attributes": True}


class MeetingRead(BaseModel):
    id: int
    title: str
    meeting_code: str
    passcode: str | None
    agenda: str | None
    host_id: int
    meeting_type: MeetingType
    status: MeetingStatus
    scheduled_start: datetime | None
    scheduled_end: datetime | None
    created_at: datetime
    updated_at: datetime
    host: UserRead
    settings: MeetingSettingsRead
    participants: list[ParticipantRead] = []

    model_config = {"from_attributes": True}


class JoinMeetingResponse(BaseModel):
    meeting: MeetingRead
    participant: ParticipantRead

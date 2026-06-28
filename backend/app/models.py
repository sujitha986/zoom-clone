from datetime import datetime, timezone
from enum import Enum

from sqlalchemy import Boolean, DateTime, Enum as SqlEnum, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .database import Base


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class MeetingType(str, Enum):
    instant = "instant"
    scheduled = "scheduled"


class MeetingStatus(str, Enum):
    scheduled = "scheduled"
    active = "active"
    ended = "ended"


class ParticipantRole(str, Enum):
    host = "host"
    guest = "guest"


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)

    hosted_meetings: Mapped[list["Meeting"]] = relationship(back_populates="host")


class Meeting(Base):
    __tablename__ = "meetings"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(160), nullable=False)
    meeting_code: Mapped[str] = mapped_column(String(20), unique=True, index=True, nullable=False)
    passcode: Mapped[str | None] = mapped_column(String(12), nullable=True)
    agenda: Mapped[str | None] = mapped_column(Text, nullable=True)
    host_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    meeting_type: Mapped[MeetingType] = mapped_column(SqlEnum(MeetingType), nullable=False)
    status: Mapped[MeetingStatus] = mapped_column(SqlEnum(MeetingStatus), nullable=False)
    scheduled_start: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    scheduled_end: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    host: Mapped[User] = relationship(back_populates="hosted_meetings")
    settings: Mapped["MeetingSettings"] = relationship(back_populates="meeting", cascade="all, delete-orphan")
    participants: Mapped[list["Participant"]] = relationship(back_populates="meeting", cascade="all, delete-orphan")


class MeetingSettings(Base):
    __tablename__ = "meeting_settings"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    meeting_id: Mapped[int] = mapped_column(ForeignKey("meetings.id"), unique=True, nullable=False)
    waiting_room_enabled: Mapped[bool] = mapped_column(Boolean, default=True)
    mute_on_join: Mapped[bool] = mapped_column(Boolean, default=True)
    camera_on_join: Mapped[bool] = mapped_column(Boolean, default=False)

    meeting: Mapped[Meeting] = relationship(back_populates="settings")


class Participant(Base):
    __tablename__ = "participants"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    meeting_id: Mapped[int] = mapped_column(ForeignKey("meetings.id"), nullable=False)
    user_name: Mapped[str] = mapped_column(String(120), nullable=False)
    user_email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    role: Mapped[ParticipantRole] = mapped_column(SqlEnum(ParticipantRole), default=ParticipantRole.guest)
    joined_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    left_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    meeting: Mapped[Meeting] = relationship(back_populates="participants")

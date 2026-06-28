export type MeetingStatus = "scheduled" | "active" | "ended";
export type MeetingType = "instant" | "scheduled";
export type ParticipantRole = "host" | "guest";

export type User = {
  id: number;
  name: string;
  email: string;
  created_at: string;
};

export type MeetingSettings = {
  id: number;
  meeting_id: number;
  waiting_room_enabled: boolean;
  mute_on_join: boolean;
  camera_on_join: boolean;
};

export type Participant = {
  id: number;
  meeting_id: number;
  user_name: string;
  user_email: string | null;
  role: ParticipantRole;
  joined_at: string;
  left_at: string | null;
};

export type Meeting = {
  id: number;
  title: string;
  meeting_code: string;
  passcode: string | null;
  agenda: string | null;
  host_id: number;
  meeting_type: MeetingType;
  status: MeetingStatus;
  scheduled_start: string | null;
  scheduled_end: string | null;
  created_at: string;
  updated_at: string;
  host: User;
  settings: MeetingSettings;
  participants: Participant[];
};

export type JoinMeetingResponse = {
  meeting: Meeting;
  participant: Participant;
};

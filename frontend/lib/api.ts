import type { JoinMeetingResponse, Meeting } from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers ?? {}),
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Something went wrong" }));
    throw new Error(error.detail ?? "Something went wrong");
  }

  return response.json();
}

export function listMeetings() {
  return request<Meeting[]>("/meetings", { cache: "no-store" });
}

export function createInstantMeeting() {
  return request<Meeting>("/meetings/instant", {
    method: "POST",
    body: JSON.stringify({
      title: "Instant Meeting",
      host_name: "Demo Host",
      host_email: "host@example.com",
    }),
  });
}

export function createScheduledMeeting(payload: {
  title: string;
  agenda?: string;
  scheduled_start: string;
  scheduled_end: string;
  passcode?: string;
  settings?: {
    waiting_room_enabled: boolean;
    mute_on_join: boolean;
    camera_on_join: boolean;
  };
}) {
  return request<Meeting>("/meetings/scheduled", {
    method: "POST",
    body: JSON.stringify({
      ...payload,
      host_name: "Demo Host",
      host_email: "host@example.com",
    }),
  });
}

export function joinMeeting(payload: {
  meeting_code: string;
  user_name: string;
  user_email?: string;
  passcode?: string;
}) {
  return request<JoinMeetingResponse>("/meetings/join", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getMeetingByCode(code: string) {
  return request<Meeting>(`/meetings/code/${encodeURIComponent(code.trim())}`, { cache: "no-store" });
}

export function endMeeting(meetingId: number) {
  return request<Meeting>(`/meetings/${meetingId}/end`, {
    method: "POST",
  });
}

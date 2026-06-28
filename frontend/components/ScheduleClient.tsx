"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarCheck } from "lucide-react";

import { createScheduledMeeting } from "@/lib/api";
import { AppShell } from "./AppShell";

function defaultStart() {
  const date = new Date();
  date.setMinutes(date.getMinutes() + 30);
  return date.toISOString().slice(0, 16);
}

function defaultEnd() {
  const date = new Date();
  date.setMinutes(date.getMinutes() + 90);
  return date.toISOString().slice(0, 16);
}

export function ScheduleClient() {
  const router = useRouter();
  const [title, setTitle] = useState("Product sync");
  const [agenda, setAgenda] = useState("");
  const [start, setStart] = useState(defaultStart());
  const [end, setEnd] = useState(defaultEnd());
  const [passcode, setPasscode] = useState("");
  const [waitingRoom, setWaitingRoom] = useState(true);
  const [muteOnJoin, setMuteOnJoin] = useState(true);
  const [cameraOnJoin, setCameraOnJoin] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    if (new Date(end) <= new Date(start)) {
      setError("End time must be after start time.");
      setSaving(false);
      return;
    }
    try {
      await createScheduledMeeting({
        title,
        agenda: agenda || undefined,
        scheduled_start: new Date(start).toISOString(),
        scheduled_end: new Date(end).toISOString(),
        passcode: passcode || undefined,
        settings: {
          waiting_room_enabled: waitingRoom,
          mute_on_join: muteOnJoin,
          camera_on_join: cameraOnJoin,
        },
      });
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to schedule meeting");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppShell>
      <section className="form-page wide">
        <div className="form-card">
          <p className="eyebrow">Schedule</p>
          <h1>Schedule a meeting</h1>
          <form onSubmit={handleSubmit}>
            <label>
              Topic
              <input onChange={(event) => setTitle(event.target.value)} required value={title} />
            </label>
            <div className="form-row">
              <label>
                Start
                <input onChange={(event) => setStart(event.target.value)} required type="datetime-local" value={start} />
              </label>
              <label>
                End
                <input onChange={(event) => setEnd(event.target.value)} required type="datetime-local" value={end} />
              </label>
            </div>
            <label>
              Agenda
              <textarea onChange={(event) => setAgenda(event.target.value)} placeholder="Optional meeting notes" value={agenda} />
            </label>
            <label>
              Passcode
              <input onChange={(event) => setPasscode(event.target.value)} placeholder="Auto-generated if blank" value={passcode} />
            </label>
            <div className="settings-strip">
              <label>
                <input checked={waitingRoom} onChange={(event) => setWaitingRoom(event.target.checked)} type="checkbox" />
                Waiting room
              </label>
              <label>
                <input checked={muteOnJoin} onChange={(event) => setMuteOnJoin(event.target.checked)} type="checkbox" />
                Mute on join
              </label>
              <label>
                <input checked={cameraOnJoin} onChange={(event) => setCameraOnJoin(event.target.checked)} type="checkbox" />
                Camera on join
              </label>
            </div>
            {error ? <div className="alert">{error}</div> : null}
            <button className="primary-button" disabled={saving} type="submit">
              <CalendarCheck size={18} />
              {saving ? "Scheduling..." : "Schedule"}
            </button>
          </form>
        </div>
      </section>
    </AppShell>
  );
}

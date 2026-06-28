"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Mic, MicOff, MonitorUp, PhoneOff, ShieldCheck, Users, Video, VideoOff, Volume2 } from "lucide-react";

import { endMeeting, getMeetingByCode } from "@/lib/api";
import type { Meeting } from "@/lib/types";

export function MeetingRoomClient({ code }: { code: string }) {
  const meetingCode = code ? decodeURIComponent(code) : "";
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [error, setError] = useState("");
  const [muted, setMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);
  const [participantsOpen, setParticipantsOpen] = useState(true);
  const [sharing, setSharing] = useState(false);
  const [audioOn, setAudioOn] = useState(true);
  const [ending, setEnding] = useState(false);

  useEffect(() => {
    if (!meetingCode) {
      setError("Meeting code is missing");
      return;
    }

    setError("");
    getMeetingByCode(meetingCode)
      .then(setMeeting)
      .catch((err) => setError(err.message));
  }, [meetingCode]);

  async function handleEnd() {
    if (!meeting) {
      return;
    }
    setEnding(true);
    try {
      await endMeeting(meeting.id);
    } catch {
      // Keep navigation available even if the local demo backend is offline.
    }
  }

  return (
    <main className="room">
      <header className="room-topbar">
        <div>
          <strong>{meeting?.title ?? "Meeting"}</strong>
          <span>{meetingCode}</span>
        </div>
        <div className="room-security">
          <ShieldCheck size={17} />
          <span>Encrypted</span>
        </div>
      </header>

      <section className="video-stage">
        {error ? <div className="room-error">{error}</div> : null}
        <div className={`speaker-tile host ${cameraOff ? "camera-off" : ""}`}>
          <span className="avatar-large">DH</span>
          <strong>{meeting?.host.name ?? "Demo Host"}</strong>
          <small>{sharing ? "Sharing screen" : cameraOff ? "Camera off" : "Host"}</small>
        </div>
        {participantsOpen ? (
          <div className="participant-grid">
            {(meeting?.participants ?? []).slice(0, 5).map((participant) => (
              <div className="mini-tile" key={participant.id}>
                <span>{participant.user_name.slice(0, 2).toUpperCase()}</span>
                <small>{participant.user_name}</small>
              </div>
            ))}
            {!meeting?.participants.length ? <div className="mini-tile empty-mini">Waiting for participants</div> : null}
          </div>
        ) : null}
      </section>

      <footer className="control-bar">
        <button className={`control-button ${muted ? "active" : ""}`} onClick={() => setMuted((value) => !value)} type="button">
          {muted ? <MicOff size={21} /> : <Mic size={21} />}
          <span>{muted ? "Unmute" : "Mute"}</span>
        </button>
        <button className={`control-button ${cameraOff ? "active" : ""}`} onClick={() => setCameraOff((value) => !value)} type="button">
          {cameraOff ? <VideoOff size={21} /> : <Video size={21} />}
          <span>{cameraOff ? "Start Video" : "Video"}</span>
        </button>
        <button
          className={`control-button ${participantsOpen ? "active" : ""}`}
          onClick={() => setParticipantsOpen((value) => !value)}
          type="button"
        >
          <Users size={21} />
          <span>Participants</span>
        </button>
        <button className={`control-button share ${sharing ? "active" : ""}`} onClick={() => setSharing((value) => !value)} type="button">
          <MonitorUp size={21} />
          <span>{sharing ? "Stop Share" : "Share"}</span>
        </button>
        <button className={`control-button ${audioOn ? "" : "active"}`} onClick={() => setAudioOn((value) => !value)} type="button">
          <Volume2 size={21} />
          <span>{audioOn ? "Audio" : "No Audio"}</span>
        </button>
        <Link className="end-button" href="/dashboard" onClick={handleEnd}>
          <PhoneOff size={20} />
          {ending ? "Ending" : "End"}
        </Link>
      </footer>
    </main>
  );
}

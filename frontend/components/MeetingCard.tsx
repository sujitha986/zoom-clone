"use client";

import Link from "next/link";
import { useState } from "react";
import { Clock, Copy, Video } from "lucide-react";

import type { Meeting } from "@/lib/types";

function formatMeetingTime(meeting: Meeting) {
  const source = meeting.scheduled_start ?? meeting.created_at;
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(source));
}

export function MeetingCard({ meeting }: { meeting: Meeting }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const text = `${meeting.title} - Meeting ID: ${meeting.meeting_code}${meeting.passcode ? ` Passcode: ${meeting.passcode}` : ""}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <article className="meeting-card">
      <div>
        <div className="meeting-meta">
          <Clock size={15} />
          <span>{formatMeetingTime(meeting)}</span>
          <span className={`status-pill ${meeting.status}`}>{meeting.status}</span>
        </div>
        <h3>{meeting.title}</h3>
        <p>Meeting ID: {meeting.meeting_code}</p>
      </div>
      <div className="meeting-actions">
        <button className="icon-button" onClick={handleCopy} title="Copy meeting code" type="button">
          <Copy size={18} />
        </button>
        {copied ? <span className="copy-feedback">Copied</span> : null}
        <Link className="primary-button compact" href={`/meeting/${encodeURIComponent(meeting.meeting_code)}`}>
          <Video size={17} />
          Start
        </Link>
      </div>
    </article>
  );
}

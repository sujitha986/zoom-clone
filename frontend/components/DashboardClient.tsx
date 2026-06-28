"use client";

import { useEffect, useState } from "react";
import { CalendarPlus, MonitorUp, Plus, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";

import { createInstantMeeting, listMeetings } from "@/lib/api";
import type { Meeting } from "@/lib/types";
import { ActionTile } from "./ActionTile";
import { AppShell } from "./AppShell";
import { MeetingCard } from "./MeetingCard";

export function DashboardClient() {
  const router = useRouter();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [now, setNow] = useState(() => new Date());
  const [shareMessage, setShareMessage] = useState("");

  useEffect(() => {
    listMeetings()
      .then(setMeetings)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30000);
    return () => window.clearInterval(timer);
  }, []);

  const filteredMeetings = meetings.filter((meeting) => {
    const text = `${meeting.title} ${meeting.meeting_code} ${meeting.status}`.toLowerCase();
    return text.includes(query.trim().toLowerCase());
  });

  const scheduledToday = meetings.filter((meeting) => {
    if (!meeting.scheduled_start) {
      return false;
    }
    return new Date(meeting.scheduled_start).toDateString() === now.toDateString();
  });

  async function handleInstantMeeting() {
    if (creating) {
      return;
    }
    setCreating(true);
    setError("");
    try {
      const meeting = await createInstantMeeting();
      router.push(`/meeting/${encodeURIComponent(meeting.meeting_code)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create meeting");
    } finally {
      setCreating(false);
    }
  }

  function handleShareScreen() {
    setShareMessage("Screen sharing is ready inside an active meeting room.");
    window.setTimeout(() => setShareMessage(""), 3000);
  }

  return (
    <AppShell onSearchChange={setQuery} searchValue={query}>
      <section className="dashboard-header">
        <div>
          <p className="eyebrow">Good morning, Demo Host</p>
          <h1>Meetings</h1>
          <p className="subtle">Create, join, and manage Zoom-style meetings from one dashboard.</p>
        </div>
        <div className="date-panel">
          <strong>
            {new Intl.DateTimeFormat("en", { hour: "numeric", minute: "2-digit" }).format(now)}
          </strong>
          <span>{new Intl.DateTimeFormat("en", { weekday: "long", month: "long", day: "numeric" }).format(now)}</span>
        </div>
      </section>

      {error ? <div className="alert">{error}</div> : null}
      {shareMessage ? <div className="notice">{shareMessage}</div> : null}

      <section className="quick-actions" aria-label="Meeting actions">
        <ActionTile
          description={creating ? "Opening room..." : "Start a meeting now"}
          icon={Plus}
          onClick={handleInstantMeeting}
          title="New Meeting"
          tone="orange"
        />
        <ActionTile description="Use a meeting ID" href="/join" icon={UserPlus} title="Join" tone="blue" />
        <ActionTile description="Plan for later" href="/schedule" icon={CalendarPlus} title="Schedule" tone="sky" />
        <ActionTile
          description="Present your screen"
          icon={MonitorUp}
          onClick={handleShareScreen}
          title="Share Screen"
          tone="green"
        />
      </section>

      <section className="content-grid">
        <div className="panel meetings-panel">
          <div className="panel-heading">
            <h2>Recent meetings</h2>
            <span>{filteredMeetings.length} shown</span>
          </div>
          {loading ? (
            <p className="empty-state">Loading meetings...</p>
          ) : filteredMeetings.length ? (
            <div className="meeting-list">
              {filteredMeetings.map((meeting) => (
                <MeetingCard meeting={meeting} key={meeting.id} />
              ))}
            </div>
          ) : (
            <p className="empty-state">
              {meetings.length ? "No meetings match your search." : "No meetings yet. Start an instant meeting to create the first record."}
            </p>
          )}
        </div>
        <aside className="panel agenda-panel">
          <div className="panel-heading">
            <h2>Today</h2>
            <span>Calendar</span>
          </div>
          {scheduledToday.length ? (
            <div className="agenda-list">
              {scheduledToday.map((meeting) => (
                <div className="agenda-item" key={meeting.id}>
                  <strong>{meeting.title}</strong>
                  <span>
                    {new Intl.DateTimeFormat("en", { hour: "numeric", minute: "2-digit" }).format(
                      new Date(meeting.scheduled_start ?? meeting.created_at),
                    )}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="agenda-empty">
              <strong>No upcoming meetings</strong>
              <span>Scheduled meetings will appear here after you create them.</span>
            </div>
          )}
        </aside>
      </section>
    </AppShell>
  );
}

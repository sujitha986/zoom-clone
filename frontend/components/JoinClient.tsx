"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, KeyRound, UserRound } from "lucide-react";

import { joinMeeting } from "@/lib/api";
import { AppShell } from "./AppShell";

export function JoinClient() {
  const router = useRouter();
  const [meetingCode, setMeetingCode] = useState("");
  const [name, setName] = useState("Guest User");
  const [email, setEmail] = useState("");
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState("");
  const [joining, setJoining] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setJoining(true);
    setError("");
    try {
      const response = await joinMeeting({
        meeting_code: meetingCode,
        user_name: name,
        user_email: email || undefined,
        passcode: passcode || undefined,
      });
      router.push(`/meeting/${encodeURIComponent(response.meeting.meeting_code)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to join meeting");
    } finally {
      setJoining(false);
    }
  }

  return (
    <AppShell>
      <section className="form-page">
        <div className="form-card">
          <p className="eyebrow">Join a meeting</p>
          <h1>Enter meeting details</h1>
          <form onSubmit={handleSubmit}>
            <label>
              Meeting ID
              <span className="input-shell">
                <KeyRound size={18} />
                <input
                  onChange={(event) => setMeetingCode(event.target.value)}
                  placeholder="123 4567 890"
                  required
                  value={meetingCode}
                />
              </span>
            </label>
            <label>
              Your name
              <span className="input-shell">
                <UserRound size={18} />
                <input onChange={(event) => setName(event.target.value)} required value={name} />
              </span>
            </label>
            <label>
              Email
              <input onChange={(event) => setEmail(event.target.value)} placeholder="optional@example.com" type="email" value={email} />
            </label>
            <label>
              Passcode
              <input onChange={(event) => setPasscode(event.target.value)} placeholder="If required" value={passcode} />
            </label>
            {error ? <div className="alert">{error}</div> : null}
            <button className="primary-button" disabled={joining} type="submit">
              {joining ? "Joining..." : "Join"}
              <ArrowRight size={18} />
            </button>
          </form>
        </div>
      </section>
    </AppShell>
  );
}

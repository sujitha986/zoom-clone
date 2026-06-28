import { MeetingRoomClient } from "@/components/MeetingRoomClient";

export default async function MeetingRoomPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  return <MeetingRoomClient code={code} />;
}

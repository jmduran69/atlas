import type { DatabaseMeeting } from "@/lib/api/meetings";

type MeetingType =
  | "google-meet"
  | "zoom"
  | "teams"
  | "discord"
  | "signal"
  | "whatsapp"
  | "phone"
  | "in-person"
  | "other";

type MeetingOutcome =
  | "achieved"
  | "partial"
  | "follow-up"
  | "rescheduled";

type MeetingStatus = "scheduled" | "in-progress" | "cancelled";

type MeetingCategory =
  | "internal"
  | "investor"
  | "client"
  | "operations"
  | "product"
  | "legal"
  | "sales"
  | "hr"
  | "partnership"
  | "vendor"
  | "other";

export type AtlasMeeting = {
  id: string | number;
  date: string;
  time: string;
  durationMinutes: number;
  title: string;
  subtitle: string;
  purpose: string;
  attendees: string;
  meetingType: MeetingType;
  destination: string;
  category: MeetingCategory;
  status: MeetingStatus;
  outcome?: MeetingOutcome;
};

export function mapDatabaseMeetingToAtlas(
  meeting: DatabaseMeeting,
): AtlasMeeting {
  return {
    id: meeting.id,
    date: meeting.meeting_date,
    time: meeting.start_time.slice(0, 5),
    durationMinutes: meeting.duration_minutes ?? 60,
    title: meeting.title,
    subtitle: meeting.subtitle ?? "",
    purpose: meeting.purpose ?? meeting.objective ?? "",
    attendees: "",
    meetingType: (meeting.meeting_type ?? "other") as MeetingType,
    destination: meeting.destination ?? "",
    category: (meeting.meeting_category ?? "other") as MeetingCategory,
    status:
      meeting.lifecycle_status === "cancelled"
        ? "cancelled"
        : meeting.lifecycle_status === "in-progress"
          ? "in-progress"
          : "scheduled",
  };
}
export type FounderId = "raj" | "yola" | "carl" | "juan";

export type MeetingType =
  | "google-meet"
  | "zoom"
  | "teams"
  | "discord"
  | "signal"
  | "whatsapp"
  | "phone"
  | "in-person"
  | "other";

export type MeetingOutcome =
  | "achieved"
  | "partial"
  | "follow-up"
  | "rescheduled";

export type MeetingStatus =
  | "scheduled"
  | "in-progress"
  | "cancelled";

export type MeetingCategory =
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

export type Meeting = {
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
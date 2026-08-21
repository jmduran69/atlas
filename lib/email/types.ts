export type EmailAddress = {
  name?: string;
  address: string;
};

export type EmailMessageSummary = {
  uid: number;
  messageId?: string;
  subject: string;
  from: EmailAddress[];
  to: EmailAddress[];
  receivedAt?: Date;
  seen: boolean;
};

export type EmailConnectionStatus = {
  connected: boolean;
  mailbox: string;
  messageCount: number;
};

export type EmailMessageContent = {
  uid: number;
  messageId?: string;
  subject: string;
  from: EmailAddress[];
  to: EmailAddress[];
  receivedAt?: Date;
  raw: string;
};
export type EmailMeetingCandidate = {
  sourceUid: number;
  sourceMessageId?: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  timezone: string;
  durationMinutes: number;
  meetingType:
    | "google-meet"
    | "zoom"
    | "teams"
    | "other";
  destination: string;
  from: EmailAddress[];
  to: EmailAddress[];
  confidence: "high" | "medium" | "low";
};
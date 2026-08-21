import { getEmailByUid } from "@/lib/email/infomaniak";
import { extractMeetingCandidate } from "@/lib/email/meeting-candidate";
import {
  createMeeting,
  findMeetingByExternalEventId,
  updateMeeting,
} from "@/lib/services/meeting.service";

export type EmailMeetingIngestionResult = {
  action: "created" | "updated" | "unchanged" | "not-a-meeting";
  meeting: Record<string, unknown> | null;
};

function getExternalEventId(
  uid: number,
  messageId?: string,
): string {
  return messageId?.trim() || `imap:${uid}`;
}

function meetingNeedsUpdate(
  existing: Record<string, unknown>,
  candidate: {
    title: string;
    date: string;
    startTime: string;
    timezone: string;
    durationMinutes: number;
    meetingType: string;
    destination: string;
  },
): boolean {
  const existingStartTime =
    typeof existing.start_time === "string"
      ? existing.start_time.slice(0, 5)
      : "";

  return (
    existing.title !== candidate.title ||
    existing.meeting_date !== candidate.date ||
    existingStartTime !== candidate.startTime ||
    existing.timezone !== candidate.timezone ||
    existing.duration_minutes !== candidate.durationMinutes ||
    existing.meeting_type !== candidate.meetingType ||
    existing.destination !== candidate.destination ||
    existing.lifecycle_status !== "scheduled"
  );
}

export async function ingestEmailMeeting(
  uid: number,
): Promise<EmailMeetingIngestionResult> {
  const email = await getEmailByUid(uid);

  if (!email) {
    throw new Error(`Email UID ${uid} was not found.`);
  }

  const candidate = await extractMeetingCandidate(email);

  if (!candidate) {
    return {
      action: "not-a-meeting",
      meeting: null,
    };
  }

  const source = "email";
  const externalEventId = getExternalEventId(
    candidate.sourceUid,
    candidate.sourceMessageId,
  );

  const existing = await findMeetingByExternalEventId(
    source,
    externalEventId,
  );

  if (existing) {
    if (!meetingNeedsUpdate(existing, candidate)) {
      return {
        action: "unchanged",
        meeting: existing,
      };
    }

    const updated = await updateMeeting(existing.id, {
      title: candidate.title,
      meeting_date: candidate.date,
      start_time: candidate.startTime,
      timezone: candidate.timezone,
      duration_minutes: candidate.durationMinutes,
      meeting_type: candidate.meetingType,
      destination: candidate.destination,
      lifecycle_status: "scheduled",
      source,
      external_event_id: externalEventId,
    });

    return {
      action: "updated",
      meeting: updated,
    };
  }

  const created = await createMeeting({
    title: candidate.title,
    meeting_date: candidate.date,
    start_time: candidate.startTime,
    timezone: candidate.timezone,
    duration_minutes: candidate.durationMinutes,
    meeting_type: candidate.meetingType,
    meeting_category: "investor",
    destination: candidate.destination,
    lifecycle_status: "scheduled",
    source,
    external_event_id: externalEventId,
  });

  return {
    action: "created",
    meeting: created,
  };
}

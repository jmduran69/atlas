import { getRecentEmails } from "@/lib/email/infomaniak";
import {
  ingestEmailMeeting,
  type EmailMeetingIngestionResult,
} from "@/lib/services/email-meeting-ingestion.service";

export type InboxProcessingItem = {
  uid: number;
  subject: string;
  action:
    | EmailMeetingIngestionResult["action"]
    | "error";
  error?: string;
};

export type InboxProcessingReport = {
  scanned: number;
  created: number;
  updated: number;
  unchanged: number;
  ignored: number;
  errors: number;
  results: InboxProcessingItem[];
};

export async function processRecentInbox(
  limit = 20,
): Promise<InboxProcessingReport> {
  const emails = await getRecentEmails(limit);

  const report: InboxProcessingReport = {
    scanned: emails.length,
    created: 0,
    updated: 0,
    unchanged: 0,
    ignored: 0,
    errors: 0,
    results: [],
  };

  for (const email of emails) {
    try {
      const result = await ingestEmailMeeting(email.uid);

      switch (result.action) {
        case "created":
          report.created += 1;
          break;

        case "updated":
          report.updated += 1;
          break;

        case "unchanged":
          report.unchanged += 1;
          break;

        case "not-a-meeting":
          report.ignored += 1;
          break;
      }

      report.results.push({
        uid: email.uid,
        subject: email.subject,
        action: result.action,
      });
    } catch (error) {
      report.errors += 1;

      report.results.push({
        uid: email.uid,
        subject: email.subject,
        action: "error",
        error:
          error instanceof Error
            ? error.message
            : "Unknown processing error",
      });
    }
  }

  return report;
}

import { getEmailConfig } from "@/lib/email/config";
import { getRecentEmails } from "@/lib/email/infomaniak";
import {
  ingestEmailMeeting,
  type EmailMeetingIngestionResult,
} from "@/lib/services/email-meeting-ingestion.service";
import { createAdminClient } from "@/lib/supabase/admin";

type ProcessingResult =
  | "created"
  | "updated"
  | "unchanged"
  | "not-a-meeting";

type ProcessingLogRow = {
  email_uid: number;
  processing_status: string;
  processing_result: string | null;
};

export type InboxProcessingItem = {
  uid: number;
  subject: string;
  action:
    | EmailMeetingIngestionResult["action"]
    | "skipped"
    | "error";
  error?: string;
};

export type InboxProcessingReport = {
  scanned: number;
  processed: number;
  skipped: number;
  created: number;
  updated: number;
  unchanged: number;
  ignored: number;
  errors: number;
  results: InboxProcessingItem[];
};

function getOrganizationId(): string {
  const organizationId = process.env.ATLAS_ORGANIZATION_ID;

  if (!organizationId) {
    throw new Error("Missing ATLAS_ORGANIZATION_ID");
  }

  return organizationId;
}

async function getProcessedEmailUids(
  organizationId: string,
  mailbox: string,
  uids: number[],
): Promise<Set<number>> {
  if (uids.length === 0) {
    return new Set();
  }

  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("email_processing_log")
    .select(
      "email_uid, processing_status, processing_result",
    )
    .eq("organization_id", organizationId)
    .eq("mailbox", mailbox)
    .eq("processing_status", "processed")
    .in("email_uid", uids);

  if (error) {
    throw new Error(
      `Unable to read email processing state: ${error.message}`,
    );
  }

  const rows = (data ?? []) as ProcessingLogRow[];

  return new Set(
    rows.map((row) => Number(row.email_uid)),
  );
}

async function recordProcessingSuccess(input: {
  organizationId: string;
  mailbox: string;
  uid: number;
  messageId?: string;
  subject: string;
  result: ProcessingResult;
  meetingId?: string;
}) {
  const supabase = createAdminClient();
  const now = new Date().toISOString();

  const { error } = await supabase
    .from("email_processing_log")
    .upsert(
      {
        organization_id: input.organizationId,
        mailbox: input.mailbox,
        email_uid: input.uid,
        message_id: input.messageId ?? null,
        subject: input.subject,
        processing_status: "processed",
        processing_result: input.result,
        meeting_id: input.meetingId ?? null,
        error_message: null,
        attempt_count: 1,
        last_attempted_at: now,
        processed_at: now,
        updated_at: now,
      },
      {
        onConflict:
          "organization_id,mailbox,email_uid",
      },
    );

  if (error) {
    throw new Error(
      `Unable to record email processing success: ${error.message}`,
    );
  }
}

async function recordProcessingFailure(input: {
  organizationId: string;
  mailbox: string;
  uid: number;
  messageId?: string;
  subject: string;
  errorMessage: string;
}) {
  const supabase = createAdminClient();
  const now = new Date().toISOString();

  const { data: existing, error: readError } =
    await supabase
      .from("email_processing_log")
      .select("attempt_count")
      .eq("organization_id", input.organizationId)
      .eq("mailbox", input.mailbox)
      .eq("email_uid", input.uid)
      .maybeSingle();

  if (readError) {
    throw new Error(
      `Unable to read failed email processing state: ${readError.message}`,
    );
  }

  const previousAttempts =
    typeof existing?.attempt_count === "number"
      ? existing.attempt_count
      : 0;

  const { error } = await supabase
    .from("email_processing_log")
    .upsert(
      {
        organization_id: input.organizationId,
        mailbox: input.mailbox,
        email_uid: input.uid,
        message_id: input.messageId ?? null,
        subject: input.subject,
        processing_status: "failed",
        processing_result: null,
        meeting_id: null,
        error_message: input.errorMessage,
        attempt_count: previousAttempts + 1,
        last_attempted_at: now,
        processed_at: null,
        updated_at: now,
      },
      {
        onConflict:
          "organization_id,mailbox,email_uid",
      },
    );

  if (error) {
    throw new Error(
      `Unable to record email processing failure: ${error.message}`,
    );
  }
}

function getMeetingId(
  result: EmailMeetingIngestionResult,
): string | undefined {
  if (
    result.action === "created" ||
    result.action === "updated" ||
    result.action === "unchanged"
  ) {
    const meetingId = result.meeting?.id;

    return typeof meetingId === "string"
      ? meetingId
      : undefined;
  }

  return undefined;
}

export async function processRecentInbox(
  limit = 20,
): Promise<InboxProcessingReport> {
  const emails = await getRecentEmails(limit);

  const organizationId = getOrganizationId();
  const mailbox = getEmailConfig().mailbox;

  const processedUids = await getProcessedEmailUids(
    organizationId,
    mailbox,
    emails.map((email) => email.uid),
  );

  const report: InboxProcessingReport = {
    scanned: emails.length,
    processed: 0,
    skipped: 0,
    created: 0,
    updated: 0,
    unchanged: 0,
    ignored: 0,
    errors: 0,
    results: [],
  };

  for (const email of emails) {
    if (processedUids.has(email.uid)) {
      report.skipped += 1;

      report.results.push({
        uid: email.uid,
        subject: email.subject,
        action: "skipped",
      });

      continue;
    }

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

      await recordProcessingSuccess({
        organizationId,
        mailbox,
        uid: email.uid,
        messageId: email.messageId,
        subject: email.subject,
        result: result.action,
        meetingId: getMeetingId(result),
      });

      report.processed += 1;

      report.results.push({
        uid: email.uid,
        subject: email.subject,
        action: result.action,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Unknown processing error";

      report.errors += 1;

      try {
        await recordProcessingFailure({
          organizationId,
          mailbox,
          uid: email.uid,
          messageId: email.messageId,
          subject: email.subject,
          errorMessage,
        });
      } catch (loggingError) {
        console.error(
          "Unable to record email processing failure:",
          loggingError,
        );
      }

      report.results.push({
        uid: email.uid,
        subject: email.subject,
        action: "error",
        error: errorMessage,
      });
    }
  }

  return report;
}

import { simpleParser } from "mailparser";

import type {
  EmailMeetingCandidate,
  EmailMessageContent,
} from "./types";

function extractZoomUrl(text: string): string {
  const match = text.match(
    /https?:\/\/(?:[\w.-]+\.)?zoom\.us\/[^\s<>"']+/i,
  );

  return match?.[0] ?? "";
}

function normalizeTime(
  hourText: string,
  minuteText: string,
  meridiem?: string,
): string {
  let hour = Number(hourText);
  const minute = Number(minuteText);

  if (meridiem) {
    const normalizedMeridiem = meridiem.toLowerCase();

    if (normalizedMeridiem === "pm" && hour !== 12) {
      hour += 12;
    }

    if (normalizedMeridiem === "am" && hour === 12) {
      hour = 0;
    }
  }

  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function monthNumber(month: string): string | null {
  const months: Record<string, string> = {
    jan: "01",
    january: "01",
    feb: "02",
    february: "02",
    mar: "03",
    march: "03",
    apr: "04",
    april: "04",
    may: "05",
    jun: "06",
    june: "06",
    jul: "07",
    july: "07",
    aug: "08",
    august: "08",
    sep: "09",
    sept: "09",
    september: "09",
    oct: "10",
    october: "10",
    nov: "11",
    november: "11",
    dec: "12",
    december: "12",
  };

  return months[month.toLowerCase()] ?? null;
}

function normalizeGmtOffset(offset: string): string {
  const match = offset.match(/^([+-])(\d{1,2})(?::(\d{2}))?$/);

  if (!match) {
    return "UTC";
  }

  const [, sign, hourText, minuteText] = match;

  const hours = Number(hourText);
  const minutes = Number(minuteText ?? "0");

  if (
    !Number.isInteger(hours) ||
    !Number.isInteger(minutes) ||
    hours > 14 ||
    minutes > 59
  ) {
    return "UTC";
  }

  if (minutes === 0) {
    return `UTC${sign}${hours}`;
  }

  return `UTC${sign}${hours}:${String(minutes).padStart(2, "0")}`;
}

function normalizeNamedTimezone(timezone: string): string {
  const normalized = timezone.trim().toUpperCase();

  const timezones: Record<string, string> = {
    UTC: "UTC",
    GMT: "UTC",
    CET: "UTC+1",
    CEST: "UTC+2",
    EET: "UTC+2",
    EEST: "UTC+3",
    IST: "UTC+5:30",
    BST: "UTC+1",
    EST: "UTC-5",
    EDT: "UTC-4",
    CST: "UTC-6",
    CDT: "UTC-5",
    MST: "UTC-7",
    MDT: "UTC-6",
    PST: "UTC-8",
    PDT: "UTC-7",
  };

  return timezones[normalized] ?? normalized;
}

function calculateDuration(
  startTime: string,
  endTime: string,
): number {
  const startMinutes =
    Number(startTime.slice(0, 2)) * 60 +
    Number(startTime.slice(3, 5));

  let endMinutes =
    Number(endTime.slice(0, 2)) * 60 +
    Number(endTime.slice(3, 5));

  if (endMinutes < startMinutes) {
    endMinutes += 24 * 60;
  }

  return endMinutes - startMinutes;
}

export async function extractMeetingCandidate(
  email: EmailMessageContent,
): Promise<EmailMeetingCandidate | null> {
  const parsed = await simpleParser(email.raw);

  const subject = parsed.subject ?? email.subject;
  const plainText = parsed.text ?? "";
  const htmlText =
    typeof parsed.html === "string" ? parsed.html : "";

  const combinedContent = `${subject}\n${plainText}\n${htmlText}`;
  const zoomUrl = extractZoomUrl(combinedContent);

  /*
   * FORMAT 1
   *
   * Calendar-style invitation where the scheduling metadata
   * appears directly in the subject.
   *
   * Example:
   *
   * Updated invitation: Prooftree/General Catalyst
   * @ Tue Aug 25, 2026 12:15pm - 12:45pm
   * (GMT+5:30)
   */
  const subjectInvitationPattern =
    /(?:updated\s+invitation|invitation):\s*(.+?)\s*@\s*(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)\s+([A-Za-z]{3,9})\s+(\d{1,2}),\s*(\d{4})\s+(\d{1,2}):(\d{2})(am|pm)\s*-\s*(\d{1,2}):(\d{2})(am|pm)\s*\(GMT([+-]\d{1,2}(?::\d{2})?)\)/i;

  const subjectMatch = subject.match(subjectInvitationPattern);

  if (subjectMatch) {
    const [
      ,
      rawTitle,
      monthText,
      dayText,
      yearText,
      startHour,
      startMinute,
      startMeridiem,
      endHour,
      endMinute,
      endMeridiem,
      offset,
    ] = subjectMatch;

    const month = monthNumber(monthText);

    if (!month) {
      return null;
    }

    const date =
      `${yearText}-${month}-${String(Number(dayText)).padStart(2, "0")}`;

    const startTime = normalizeTime(
      startHour,
      startMinute,
      startMeridiem,
    );

    const endTime = normalizeTime(
      endHour,
      endMinute,
      endMeridiem,
    );

    return {
      sourceUid: email.uid,
      sourceMessageId: email.messageId,
      title: rawTitle.trim(),
      date,
      startTime,
      endTime,
      timezone: normalizeGmtOffset(offset),
      durationMinutes: calculateDuration(startTime, endTime),
      meetingType: zoomUrl ? "zoom" : "other",
      destination: zoomUrl,
      from: email.from,
      to: email.to,
      confidence: zoomUrl ? "high" : "medium",
    };
  }

  /*
   * FORMAT 2
   *
   * Human-readable invitation where the meeting information
   * appears in the plain-text body.
   *
   * Example:
   *
   * Meeting title: Atlas Automatic Meeting Test
   * Date: Thursday, 27 August 2026
   * Time: 18:00 CEST
   */
  const bodyTitleMatch = plainText.match(
    /^Meeting title:\s*(.+)$/im,
  );

  const bodyDateMatch = plainText.match(
    /^Date:\s*(?:(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday),?\s+)?(\d{1,2})\s+([A-Za-z]{3,9})\s+(\d{4})\s*$/im,
  );

  const bodyTimeMatch = plainText.match(
    /^Time:\s*(\d{1,2}):(\d{2})(?:\s*-\s*(\d{1,2}):(\d{2}))?\s+([A-Za-z]{2,6})\s*$/im,
  );

  if (
    bodyTitleMatch &&
    bodyDateMatch &&
    bodyTimeMatch
  ) {
    const rawTitle = bodyTitleMatch[1].trim();

    const dayText = bodyDateMatch[1];
    const monthText = bodyDateMatch[2];
    const yearText = bodyDateMatch[3];

    const month = monthNumber(monthText);

    if (!month) {
      return null;
    }

    const date =
      `${yearText}-${month}-${String(Number(dayText)).padStart(2, "0")}`;

    const startTime = normalizeTime(
      bodyTimeMatch[1],
      bodyTimeMatch[2],
    );

    const explicitEndTime =
      bodyTimeMatch[3] && bodyTimeMatch[4]
        ? normalizeTime(
            bodyTimeMatch[3],
            bodyTimeMatch[4],
          )
        : null;

    const durationMinutes = explicitEndTime
      ? calculateDuration(startTime, explicitEndTime)
      : 60;

    const endDate = new Date(
      `2000-01-01T${startTime}:00Z`,
    );

    endDate.setUTCMinutes(
      endDate.getUTCMinutes() + durationMinutes,
    );

    const endTime =
      `${String(endDate.getUTCHours()).padStart(2, "0")}:` +
      `${String(endDate.getUTCMinutes()).padStart(2, "0")}`;

    const timezone = normalizeNamedTimezone(
      bodyTimeMatch[5],
    );

    return {
      sourceUid: email.uid,
      sourceMessageId: email.messageId,
      title: rawTitle,
      date,
      startTime,
      endTime,
      timezone,
      durationMinutes,
      meetingType: zoomUrl ? "zoom" : "other",
      destination: zoomUrl,
      from: email.from,
      to: email.to,
      confidence: zoomUrl ? "high" : "medium",
    };
  }

  return null;
}

import { simpleParser } from "mailparser";

import type {
  EmailMeetingCandidate,
  EmailMessageContent,
} from "./types";

function cleanUrl(url: string): string {
  return url
    .replace(/&amp;/gi, "&")
    .replace(/[)\]}>.,;]+$/g, "")
    .trim();
}

function extractZoomUrl(text: string): string {
  const patterns = [
    /https?:\/\/(?:[\w.-]+\.)?zoom\.us\/j\/[^\s<>"']+/i,
    /https?:\/\/(?:[\w.-]+\.)?zoom\.us\/wc\/[^\s<>"']+/i,
    /https?:\/\/(?:[\w.-]+\.)?zoom\.us\/[^\s<>"']+/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);

    if (match?.[0]) {
      return cleanUrl(match[0]);
    }
  }

  return "";
}

function normalizeTime(
  hourText: string,
  minuteText: string,
  meridiem?: string,
): string {
  let hour = Number(hourText);
  const minute = Number(minuteText);

  if (meridiem) {
    if (meridiem.toLowerCase() === "pm" && hour !== 12) {
      hour += 12;
    }

    if (meridiem.toLowerCase() === "am" && hour === 12) {
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

function normalizeTimezone(timezone: string): string {
  const value = timezone.trim();

  const knownZones: Record<string, string> = {
    CEST: "UTC+2",
    CET: "UTC+1",
    PDT: "UTC-7",
    PST: "UTC-8",
    EDT: "UTC-4",
    EST: "UTC-5",
    BST: "UTC+1",
    GMT: "UTC",
    UTC: "UTC",
    IST: "UTC+5:30",
  };

  const upper = value.toUpperCase();

  if (knownZones[upper]) {
    return knownZones[upper];
  }

  if (/^UTC[+-]/i.test(value)) {
    return value.toUpperCase();
  }

  if (/^GMT[+-]/i.test(value)) {
    return value.replace(/^GMT/i, "UTC");
  }

  if (/zurich/i.test(value)) {
    return "Europe/Zurich";
  }

  return value;
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

function buildCandidate(
  email: EmailMessageContent,
  input: {
    title: string;
    date: string;
    startTime: string;
    endTime: string;
    timezone: string;
    durationMinutes: number;
    combinedContent: string;
    platformHint?: string;
  },
): EmailMeetingCandidate {
  const zoomUrl = extractZoomUrl(input.combinedContent);

  const zoomDetected =
    Boolean(zoomUrl) ||
    /zoom/i.test(input.platformHint ?? "") ||
    /\bzoom\b/i.test(input.combinedContent);

  return {
    sourceUid: email.uid,
    sourceMessageId: email.messageId,
    title: input.title.trim(),
    date: input.date,
    startTime: input.startTime,
    endTime: input.endTime,
    timezone: input.timezone,
    durationMinutes: input.durationMinutes,
    meetingType: zoomDetected ? "zoom" : "other",
    destination: zoomUrl,
    from: email.from,
    to: email.to,
    confidence: zoomUrl ? "high" : "medium",
  };
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

  /*
   * FORMAT 1
   *
   * Google / calendar invitation subject:
   *
   * Invitation: Meeting Name @ Tue Aug 25, 2026
   * 12:15pm - 12:45pm (GMT+5:30)
   */
  const invitationPattern =
    /(?:updated\s+invitation|invitation):\s*(.+?)\s*@\s*(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)\s+([A-Za-z]{3,9})\s+(\d{1,2}),\s*(\d{4})\s+(\d{1,2}):(\d{2})(am|pm)\s*-\s*(\d{1,2}):(\d{2})(am|pm)\s*\(GMT([+-]\d{1,2}(?::\d{2})?)\)/i;

  const invitationMatch = subject.match(invitationPattern);

  if (invitationMatch) {
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
    ] = invitationMatch;

    const month = monthNumber(monthText);

    if (month) {
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

      return buildCandidate(email, {
        title: rawTitle,
        date,
        startTime,
        endTime,
        timezone: normalizeGmtOffset(offset),
        durationMinutes: calculateDuration(
          startTime,
          endTime,
        ),
        combinedContent,
      });
    }
  }

  /*
   * FORMAT 2
   *
   * Human / structured meeting email:
   *
   * Meeting title: Atlas Automatic Meeting Test
   * Date: Thursday, 27 August 2026
   * Time: 18:00 CEST
   * Duration: 30 minutes
   * Platform: Zoom
   */
  const structuredTitleMatch = plainText.match(
    /Meeting\s+title:\s*(.+)/i,
  );

  const structuredDateMatch = plainText.match(
    /Date:\s*(?:(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday),?\s*)?(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/i,
  );

  const structuredTimeMatch = plainText.match(
    /Time:\s*(\d{1,2}):(\d{2})\s*([A-Za-z]+(?:[+-]\d+(?::\d+)?)?)/i,
  );

  const structuredDurationMatch = plainText.match(
    /Duration:\s*(\d+)\s*(?:minutes?|mins?)/i,
  );

  const structuredPlatformMatch = plainText.match(
    /Platform:\s*(.+)/i,
  );

  if (
    structuredTitleMatch &&
    structuredDateMatch &&
    structuredTimeMatch
  ) {
    const [, dayText, monthText, yearText] =
      structuredDateMatch;

    const month = monthNumber(monthText);

    if (month) {
      const startTime = normalizeTime(
        structuredTimeMatch[1],
        structuredTimeMatch[2],
      );

      const durationMinutes = structuredDurationMatch
        ? Number(structuredDurationMatch[1])
        : 60;

      const startTotal =
        Number(startTime.slice(0, 2)) * 60 +
        Number(startTime.slice(3, 5));

      const endTotal = startTotal + durationMinutes;

      const endHour =
        Math.floor((endTotal % (24 * 60)) / 60);

      const endMinute = endTotal % 60;

      const endTime =
        `${String(endHour).padStart(2, "0")}:${String(endMinute).padStart(2, "0")}`;

      const date =
        `${yearText}-${month}-${String(Number(dayText)).padStart(2, "0")}`;

      return buildCandidate(email, {
        title: structuredTitleMatch[1].trim(),
        date,
        startTime,
        endTime,
        timezone: normalizeTimezone(
          structuredTimeMatch[3],
        ),
        durationMinutes,
        combinedContent,
        platformHint:
          structuredPlatformMatch?.[1] ?? "",
      });
    }
  }

  /*
   * FORMAT 3
   *
   * Native Zoom invitation:
   *
   * Juan Duran is inviting you to a scheduled Zoom meeting.
   *
   * Topic: Test Meeting
   * Time: Sep 2, 2026 01:00 AM Zurich
   * Join Zoom Meeting
   * https://us02web.zoom.us/j/...
   */
  const zoomTopicMatch = plainText.match(
    /^Topic:\s*(.+)$/im,
  );

  const zoomTimeMatch = plainText.match(
    /^Time:\s*([A-Za-z]{3,9})\s+(\d{1,2}),\s*(\d{4})\s+(\d{1,2}):(\d{2})\s*(AM|PM)\s+(.+)$/im,
  );

  const zoomUrl = extractZoomUrl(combinedContent);

  if (zoomTopicMatch && zoomTimeMatch && zoomUrl) {
    const [
      ,
      monthText,
      dayText,
      yearText,
      hourText,
      minuteText,
      meridiem,
      timezoneText,
    ] = zoomTimeMatch;

    const month = monthNumber(monthText);

    if (month) {
      const startTime = normalizeTime(
        hourText,
        minuteText,
        meridiem,
      );

      /*
       * Native Zoom invitation emails normally do not
       * include the scheduled duration in the body.
       * Until Atlas receives duration from a calendar
       * object/API, default these invitations to 60 min.
       */
      const durationMinutes = 60;

      const startTotal =
        Number(startTime.slice(0, 2)) * 60 +
        Number(startTime.slice(3, 5));

      const endTotal = startTotal + durationMinutes;

      const endHour =
        Math.floor((endTotal % (24 * 60)) / 60);

      const endMinute = endTotal % 60;

      const endTime =
        `${String(endHour).padStart(2, "0")}:${String(endMinute).padStart(2, "0")}`;

      const date =
        `${yearText}-${month}-${String(Number(dayText)).padStart(2, "0")}`;

      return buildCandidate(email, {
        title: zoomTopicMatch[1].trim(),
        date,
        startTime,
        endTime,
        timezone: normalizeTimezone(
          timezoneText.trim(),
        ),
        durationMinutes,
        combinedContent,
        platformHint: "zoom",
      });
    }
  }

  return null;
}

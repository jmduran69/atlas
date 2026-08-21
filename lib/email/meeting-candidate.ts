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
  meridiem: string,
): string {
  let hour = Number(hourText);
  const minute = Number(minuteText);

  if (meridiem.toLowerCase() === "pm" && hour !== 12) {
    hour += 12;
  }

  if (meridiem.toLowerCase() === "am" && hour === 12) {
    hour = 0;
  }

  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function monthNumber(month: string): string | null {
  const months: Record<string, string> = {
    jan: "01",
    feb: "02",
    mar: "03",
    apr: "04",
    may: "05",
    jun: "06",
    jul: "07",
    aug: "08",
    sep: "09",
    oct: "10",
    nov: "11",
    dec: "12",
  };

  return months[month.slice(0, 3).toLowerCase()] ?? null;
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

  const invitationPattern =
    /(?:updated\s+invitation|invitation):\s*(.+?)\s*@\s*(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)\s+([A-Za-z]{3,9})\s+(\d{1,2}),\s*(\d{4})\s+(\d{1,2}):(\d{2})(am|pm)\s*-\s*(\d{1,2}):(\d{2})(am|pm)\s*\(GMT([+-]\d{1,2}(?::\d{2})?)\)/i;

  const match = subject.match(invitationPattern);

  if (!match) {
    return null;
  }

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
  ] = match;

  const month = monthNumber(monthText);

  if (!month) {
    return null;
  }

  const date = `${yearText}-${month}-${String(Number(dayText)).padStart(2, "0")}`;

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

  const startMinutes =
    Number(startTime.slice(0, 2)) * 60 +
    Number(startTime.slice(3, 5));

  let endMinutes =
    Number(endTime.slice(0, 2)) * 60 +
    Number(endTime.slice(3, 5));

  if (endMinutes < startMinutes) {
    endMinutes += 24 * 60;
  }

  const zoomUrl = extractZoomUrl(combinedContent);

  return {
    sourceUid: email.uid,
    sourceMessageId: email.messageId,
    title: rawTitle.trim(),
    date,
    startTime,
    endTime,
    timezone: `GMT${offset}`,
    durationMinutes: endMinutes - startMinutes,
    meetingType: zoomUrl ? "zoom" : "other",
    destination: zoomUrl,
    from: email.from,
    to: email.to,
    confidence: zoomUrl ? "high" : "medium",
  };
}
"use client";

import { FormEvent, useEffect, useState } from "react";

import { useMeetings } from "@/lib/hooks/useMeetings";
import { deleteMeeting as deleteMeetingApi } from "@/lib/api/meetings";

import ExecutiveBrief from "./components/ExecutiveBrief";

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

type FounderName = "Raj" | "Yola" | "Carl" | "Juan";

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

const founders: FounderName[] = ["Raj", "Yola", "Carl", "Juan"];

const meetingCategories: { value: MeetingCategory; label: string }[] = [
  { value: "internal", label: "Internal Founder" },
  { value: "investor", label: "Investor" },
  { value: "client", label: "Client" },
  { value: "operations", label: "Operations" },
  { value: "product", label: "Product" },
  { value: "legal", label: "Legal" },
  { value: "sales", label: "Sales" },
  { value: "hr", label: "HR" },
  { value: "partnership", label: "Partnership" },
  { value: "vendor", label: "Vendor" },
  { value: "other", label: "Other" },
];

const meetingStatuses: { value: MeetingStatus; label: string; symbol: string }[] = [
  { value: "scheduled", label: "Scheduled", symbol: "●" },
  { value: "in-progress", label: "In Progress", symbol: "◐" },
  { value: "cancelled", label: "Cancelled", symbol: "×" },
];

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function meetingStartDate(meeting: Pick<Meeting, "date" | "time">) {
  const [year, month, day] = meeting.date.split("-").map(Number);
  const [hour, minute] = meeting.time.split(":").map(Number);

  return new Date(year, month - 1, day, hour, minute, 0, 0);
}

function meetingEndDate(
  meeting: Pick<Meeting, "date" | "time" | "durationMinutes">,
) {
  const end = meetingStartDate(meeting);
  end.setMinutes(end.getMinutes() + meeting.durationMinutes);
  return end;
}

function formatClockTime(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

function formatMeetingLength(minutes: number) {
  return `${minutes} minute${minutes === 1 ? "" : "s"}`;
}

function formatDuration(totalSeconds: number) {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function formatFriendlyCountdown(totalSeconds: number) {
  const safeSeconds = Math.max(0, Math.ceil(totalSeconds));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.ceil((safeSeconds % 3600) / 60);

  if (hours > 0) {
    return `Starts in ${hours}h ${minutes}m`;
  }

  return `Starts in ${Math.max(1, minutes)} minute${
    Math.max(1, minutes) === 1 ? "" : "s"
  }`;
}
type Meeting = {
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

type NewMeetingForm = {
  title: string;
  date: string;
  time: string;
  durationMinutes: number;
  purpose: string;
  founderAttendees: FounderName[];
  otherAttendees: string;
  meetingType: MeetingType;
  destination: string;
  category: MeetingCategory;
  status: MeetingStatus;
};

const meetingTypes: {
  value: MeetingType;
  label: string;
  symbol: string;
}[] = [
  { value: "google-meet", label: "Google Meet", symbol: "●" },
  { value: "zoom", label: "Zoom", symbol: "◉" },
  { value: "teams", label: "Teams", symbol: "◆" },
  { value: "discord", label: "Discord", symbol: "◈" },
  { value: "signal", label: "Signal", symbol: "◌" },
  { value: "whatsapp", label: "WhatsApp", symbol: "●" },
  { value: "phone", label: "Phone", symbol: "☎" },
  { value: "in-person", label: "In Person", symbol: "⌖" },
  { value: "other", label: "Other", symbol: "↗" },
];

const meetingDurations = [15, 25, 30, 45, 60, 90, 120];

const initialMeetings: Meeting[] = [
  {
    id: 1,
    date: todayIso(),
    time: "09:00",
    durationMinutes: 45,
    title: "Cherry Ventures",
    subtitle: "Series A Investment Discussion",
    purpose: "Secure agreement to proceed to due diligence.",
    attendees: "Juan · Rajarshi · Cherry Ventures",
    meetingType: "google-meet",
    destination: "https://meet.google.com/hex-qmgq-pmr",
    category: "investor",
  status: "scheduled",
  },
  {
    id: 2,
    date: todayIso(),
    time: "11:30",
    durationMinutes: 60,
    title: "Engineering Strategy",
    subtitle: "Product and infrastructure priorities",
    purpose: "Confirm the next development priorities for Atlas.",
    attendees: "Juan · Product Team",
    meetingType: "discord",
    destination: "Atlas Product Team",
    category: "product",
  status: "scheduled",
  },
  {
    id: 3,
    date: todayIso(),
    time: "14:00",
    durationMinutes: 25,
    title: "Adani Investment",
    subtitle: "Strategic investment discussion",
    purpose: "Establish interest and agree on the next conversation.",
    attendees: "Juan · Founders · Investment Team",
    meetingType: "teams",
    destination: "https://teams.microsoft.com/",
    category: "investor",
  status: "scheduled",
  },
  {
    id: 4,
    date: todayIso(),
    time: "16:00",
    durationMinutes: 45,
    title: "Founder Review",
    subtitle: "Decisions, blockers, and next steps",
    purpose: "Leave with clear ownership of every immediate priority.",
    attendees: "All Founders",
    meetingType: "signal",
    destination: "Atlas Founders",
    category: "internal",
  status: "scheduled",
  },
];

const initialCompleted: Meeting[] = [
  {
    id: 101,
    date: todayIso(),
    time: "08:00",
    durationMinutes: 30,
    title: "Founder Stand-up",
    subtitle: "Priorities, decisions, and immediate blockers",
    purpose: "",
    attendees: "",
    meetingType: "teams",
    destination: "",
    category: "operations",
    status: "scheduled",
    outcome: "achieved",
  },
  {
    id: 102,
    date: todayIso(),
    time: "08:45",
    durationMinutes: 30,
    title: "Legal Review",
    subtitle: "Document and compliance review",
    purpose: "",
    attendees: "",
    meetingType: "google-meet",
    destination: "",
    category: "legal",
    status: "scheduled",
    outcome: "partial",
  },
];

const emptyMeetingForm: NewMeetingForm = {
  title: "",
  date: todayIso(),
  time: "",
  durationMinutes: 60,
  purpose: "",
  founderAttendees: [],
  otherAttendees: "",
  meetingType: "google-meet",
  destination: "",
  category: "internal",
  status: "scheduled",
};

function getMeetingTypeLabel(type: MeetingType) {
  return (
    meetingTypes.find((meetingType) => meetingType.value === type)?.label ??
    "Meeting"
  );
}

function detectMeetingType(value: string): MeetingType | null {
  const normalized = value.toLowerCase();

  if (normalized.includes("meet.google.com")) return "google-meet";
  if (normalized.includes("zoom.us")) return "zoom";
  if (
    normalized.includes("teams.microsoft.com") ||
    normalized.includes("teams.live.com")
  ) {
    return "teams";
  }
  if (normalized.includes("discord.gg") || normalized.includes("discord.com")) {
    return "discord";
  }
  if (normalized.includes("signal.me")) return "signal";
  if (
    normalized.includes("wa.me") ||
    normalized.includes("whatsapp.com")
  ) {
    return "whatsapp";
  }

  return null;
}

function destinationLabel(type: MeetingType) {
  switch (type) {
    case "phone":
      return "Phone number";
    case "in-person":
      return "Meeting location";
    case "signal":
      return "Signal group or link";
    case "whatsapp":
      return "WhatsApp chat or link";
    case "discord":
      return "Discord channel or link";
    case "other":
      return "Link or location";
    default:
      return "Meeting link";
  }
}

function destinationPlaceholder(type: MeetingType) {
  switch (type) {
    case "google-meet":
      return "https://meet.google.com/...";
    case "zoom":
      return "https://zoom.us/j/...";
    case "teams":
      return "https://teams.microsoft.com/...";
    case "discord":
      return "Discord channel or invitation link";
    case "signal":
      return "Signal group name or invitation link";
    case "whatsapp":
      return "WhatsApp chat or invitation link";
    case "phone":
      return "+41 79 000 00 00";
    case "in-person":
      return "Office, café, or full address";
    default:
      return "Add a link or location";
  }
}

function getActionDetails(meeting: Meeting) {
  const destination = meeting.destination.trim();

  if (!destination) return null;

  switch (meeting.meetingType) {
    case "google-meet":
      return {
        label: "Join Google Meet",
        href: destination,
        symbol: "●",
      };

    case "zoom":
      return {
        label: "Join Zoom",
        href: destination,
        symbol: "◉",
      };

    case "teams":
      return {
        label: "Join Teams",
        href: destination,
        symbol: "◆",
      };

    case "discord":
      return destination.startsWith("http")
        ? {
            label: "Open Discord",
            href: destination,
            symbol: "◈",
          }
        : null;

    case "signal":
      return destination.startsWith("http")
        ? {
            label: "Open Signal",
            href: destination,
            symbol: "◌",
          }
        : null;

    case "whatsapp":
      return destination.startsWith("http")
        ? {
            label: "Open WhatsApp",
            href: destination,
            symbol: "●",
          }
        : null;

    case "phone": {
      const cleanedNumber = destination.replace(/[^\d+]/g, "");

      return {
        label: "Call",
        href: `tel:${cleanedNumber}`,
        symbol: "☎",
      };
    }

    case "in-person": {
      const mapsDestination = encodeURIComponent(destination);

      return {
        label: "Open in Maps",
        href: `https://www.google.com/maps/search/?api=1&query=${mapsDestination}`,
        symbol: "⌖",
      };
    }

    case "other":
      return destination.startsWith("http")
        ? {
            label: "Open Meeting Link",
            href: destination,
            symbol: "↗",
          }
        : null;
  }
}

function outcomeDetails(outcome?: MeetingOutcome) {
  switch (outcome) {
    case "achieved":
      return { label: "Achieved", symbol: "✓" };
    case "partial":
      return { label: "Partial", symbol: "◐" };
    case "follow-up":
      return { label: "Follow-up", symbol: "→" };
    case "rescheduled":
      return { label: "Rescheduled", symbol: "↻" };
    default:
      return { label: "Finished", symbol: "✓" };
  }
}

export default function Home() {
  const greeting = "Executive Operating System";

const {
  meetings,
  setMeetings,
  addMeeting,
  reloadMeetings,
} = useMeetings();
  const [completed, setCompleted] = useState(initialCompleted);
  const [isExpanded, setIsExpanded] = useState(false);
  const [thinking, setThinking] = useState("What is the single most important decision the founders need to make today?\n\n");
  const [isCreatingMeeting, setIsCreatingMeeting] = useState(false);
  const [isChoosingOutcome, setIsChoosingOutcome] = useState(false);
  const [newMeeting, setNewMeeting] =
    useState<NewMeetingForm>(emptyMeetingForm);
  const [formError, setFormError] = useState("");
  const [editingMeetingId, setEditingMeetingId] =
  useState<string | number | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
  setIsMounted(true);
  setNow(new Date());

  const timer = window.setInterval(() => {
    setNow(new Date());
  }, 1000);

  return () => window.clearInterval(timer);
}, []);

  const nowTime = now?.getTime() ?? 0;

  const sortedMeetings = [...meetings].sort(
    (first, second) =>
      meetingStartDate(first).getTime() - meetingStartDate(second).getTime(),
  );

  const nonCancelledMeetings = sortedMeetings.filter(
    (meeting) => meeting.status !== "cancelled",
  );

  const activeMeeting = nonCancelledMeetings.find((meeting) => {
    const startTime = meetingStartDate(meeting).getTime();
    const endTime = meetingEndDate(meeting).getTime();

    return nowTime >= startTime && nowTime < endTime;
  });

  const nextMeeting = nonCancelledMeetings.find(
    (meeting) => meetingStartDate(meeting).getTime() > nowTime,
  );

  const currentMeeting = !isMounted
    ? nonCancelledMeetings[0]
    : activeMeeting ?? nextMeeting ?? nonCancelledMeetings.at(-1);

  const upcomingMeetings = currentMeeting
    ? sortedMeetings.filter(
        (meeting) =>
          meeting.id !== currentMeeting.id &&
          meetingStartDate(meeting).getTime() >
            meetingStartDate(currentMeeting).getTime(),
      )
    : sortedMeetings;

  const currentMeetingStart = currentMeeting
    ? meetingStartDate(currentMeeting)
    : null;

  const currentMeetingEnd = currentMeeting
    ? meetingEndDate(currentMeeting)
    : null;

  const secondsFromStart =
    isMounted && currentMeetingStart
      ? (nowTime - currentMeetingStart.getTime()) / 1000
      : 0;

  const currentDisplayStatus: MeetingStatus | null = currentMeeting
    ? currentMeeting.status === "cancelled"
      ? "cancelled"
      : !isMounted || !currentMeetingEnd
        ? "scheduled"
        : currentMeeting.status === "in-progress" ||
            (secondsFromStart >= 0 && nowTime < currentMeetingEnd.getTime())
          ? "in-progress"
          : "scheduled"
    : null;

  const secondsUntilEnd =
    currentMeetingEnd && isMounted
      ? Math.max(0, (currentMeetingEnd.getTime() - nowTime) / 1000)
      : 0;

  const timeUntilMeeting = !isMounted
    ? "Calculating live time…"
    : currentMeetingStart && currentMeetingEnd
      ? secondsFromStart >= 0 && nowTime < currentMeetingEnd.getTime()
        ? `${formatDuration(secondsUntilEnd)} remaining`
        : secondsFromStart >= 0
          ? `Scheduled window ended at ${formatClockTime(currentMeetingEnd)}`
          : Math.abs(secondsFromStart) <= 300
            ? `Starts in ${formatDuration(Math.abs(secondsFromStart))}`
            : formatFriendlyCountdown(Math.abs(secondsFromStart))
      : "";

  const countdownWindowSeconds = 60 * 60;
  const secondsUntilStart = Math.max(0, -secondsFromStart);
  const meetingDurationSeconds = currentMeeting
    ? currentMeeting.durationMinutes * 60
    : 0;
  const isMeetingLive =
    Boolean(isMounted && currentMeetingStart && currentMeetingEnd) &&
    secondsFromStart >= 0 &&
    nowTime < (currentMeetingEnd?.getTime() ?? 0);

  const timelineProgress =
    isMounted && currentMeetingStart
      ? isMeetingLive && meetingDurationSeconds > 0
        ? Math.max(
            0,
            Math.min(100, (secondsFromStart / meetingDurationSeconds) * 100),
          )
        : secondsFromStart >= meetingDurationSeconds &&
            meetingDurationSeconds > 0
          ? 100
          : Math.max(
              0,
              Math.min(
                100,
                ((countdownWindowSeconds - secondsUntilStart) /
                  countdownWindowSeconds) *
                  100,
              ),
            )
      : 0;

  const timelineLabel = !isMounted
    ? "Preparing live timeline"
    : isMeetingLive
      ? "Meeting progress"
      : currentMeetingStart
        ? secondsFromStart >= meetingDurationSeconds &&
          meetingDurationSeconds > 0
          ? "Scheduled window complete"
          : secondsUntilStart > countdownWindowSeconds
            ? "Preparation window opens 60 minutes before start"
            : secondsUntilStart <= 300
              ? "Final readiness"
              : "Approaching meeting"
        : "";

  const currentAction = currentMeeting
    ? getActionDetails(currentMeeting)
    : null;

  function openMeetingCreator() {
    setEditingMeetingId(null);
    setFormError("");
    setNewMeeting(emptyMeetingForm);
    setIsCreatingMeeting(true);
  }

  function openMeetingEditor(meeting: Meeting) {
    const selectedFounders = founders.filter((founder) =>
      meeting.attendees.includes(founder),
    );

    const otherAttendees = meeting.attendees
      .split(" · ")
      .filter((attendee) => !founders.includes(attendee as FounderName))
      .filter((attendee) => attendee !== "All Founders")
      .join(" · ");

    setEditingMeetingId(meeting.id);
    setFormError("");
    setNewMeeting({
      title: meeting.title,
      date: meeting.date,
      time: meeting.time,
      durationMinutes: meeting.durationMinutes,
      purpose: meeting.purpose,
      founderAttendees:
        meeting.attendees === "All Founders" ? [...founders] : selectedFounders,
      otherAttendees,
      meetingType: meeting.meetingType,
      destination: meeting.destination,
      category: meeting.category,
      status: meeting.status,
    });
    setIsCreatingMeeting(true);
  }

  function closeMeetingCreator() {
    setIsCreatingMeeting(false);
    setEditingMeetingId(null);
    setFormError("");
    setNewMeeting(emptyMeetingForm);
  }

  async function deleteMeeting(meeting: Meeting) {
  const confirmed = window.confirm(
    `Delete “${meeting.title}” from Atlas? This cannot be undone.`,
  );

  if (!confirmed) return;

  try {
    await deleteMeetingApi(String(meeting.id));
    await reloadMeetings();
    setIsExpanded(false);
  } catch (error) {
    console.error(error);
    alert("Unable to delete the meeting. Please try again.");
  }
}

  async function createMeeting(event: FormEvent<HTMLFormElement>) {
  event.preventDefault();

  if (!newMeeting.title.trim()) {
    setFormError("Please give the meeting a title.");
    return;
  }

  if (!newMeeting.time) {
    setFormError("Please select a meeting time.");
    return;
  }

  setFormError("");

  try {
    const savedMeeting = await addMeeting({
      title: newMeeting.title.trim(),
      subtitle: newMeeting.purpose.trim() || "New meeting",
      purpose:
        newMeeting.purpose.trim() ||
        "Clarify what success should look like before the meeting begins.",
      objective: newMeeting.purpose.trim() || undefined,
      meeting_date: newMeeting.date,
      start_time: newMeeting.time,
    });


    closeMeetingCreator();
  } catch (error) {
    setFormError(
      error instanceof Error
        ? error.message
        : "Atlas could not save this meeting.",
    );
  }
}
  function toggleFounder(founder: FounderName) {  
    setNewMeeting((previous) => ({
      ...previous,
      founderAttendees: previous.founderAttendees.includes(founder)
        ? previous.founderAttendees.filter((name) => name !== founder)
        : [...previous.founderAttendees, founder],
    }));
  }

  function toggleAllFounders() {
    setNewMeeting((previous) => ({
      ...previous,
      founderAttendees:
        previous.founderAttendees.length === founders.length
          ? []
          : [...founders],
    }));
  }

  async function recordOutcome(outcome: MeetingOutcome) {
    if (!currentMeeting) return;

    const completedMeeting = {
      ...currentMeeting,
      outcome,
    };

    setCompleted((previous) => [...previous, completedMeeting]);

    await reloadMeetings();

    setIsExpanded(false);
    setIsChoosingOutcome(false);
  }

  function getStatusDetails(status: MeetingStatus) {
    return (
      meetingStatuses.find((item) => item.value === status) ??
      meetingStatuses[0]
    );
  }

  function getCategoryLabel(category: MeetingCategory) {
  return (
    meetingCategories.find((item) => item.value === category)?.label ??
    "Other"
  );
}

const rowActionStyle = {
  padding: 0,
  border: 0,
  backgroundColor: "transparent",
  color: "#60738A",
  fontFamily: "inherit",
  fontSize: "11px",
  fontWeight: 700,
  cursor: "pointer",
};

const labelStyle = {
    display: "block",
    marginBottom: "8px",
    fontSize: "12px",
    fontWeight: 700,
    color: "#7B8493",
    textTransform: "uppercase" as const,
    letterSpacing: "0.1em",
  };

  const inputStyle = {
    boxSizing: "border-box" as const,
    width: "100%",
    minHeight: "48px",
    padding: "12px 14px",
    border: "1px solid #DDE3EA",
    borderRadius: "13px",
    backgroundColor: "#FFFFFF",
    color: "#1F2937",
    fontFamily: "inherit",
    fontSize: "15px",
    outline: "none",
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#F7F8FA",
        color: "#111827",
        fontFamily: "Inter, Arial, sans-serif",
        padding: "64px 28px 80px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "1080px",
          margin: "0 auto",
        }}
      >
        <header
          style={{
            textAlign: "center",
            marginBottom: "64px",
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: "64px",
              fontWeight: 700,
              letterSpacing: "-2px",
            }}
          >
            Atlas
          </h1>

          <p
            style={{
              margin: "14px 0 0",
              fontSize: "24px",
              color: "#6B7280",
            }}
          >
            {greeting}
          </p>

          <p
            style={{
              margin: "10px 0 0",
              fontSize: "16px",
              color: "#9CA3AF",
            }}
          >
            {isMounted && now
              ? new Intl.DateTimeFormat("en-GB", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                }).format(now)
              : "Loading today’s date…"}
          </p>
        </header>

        <section className="atlas-grid">
          <div>
            {currentMeeting ? (
              <div
                style={{
                  position: "relative",
                  marginBottom: "34px",
                }}
              >
                {upcomingMeetings.length > 1 && (
                  <div
                    aria-hidden="true"
                    style={{
                      position: "absolute",
                      left: "22px",
                      right: "22px",
                      top: "18px",
                      bottom: "-18px",
                      borderRadius: "28px",
                      backgroundColor: "#E8EDF3",
                      border: "1px solid #DFE5EC",
                    }}
                  />
                )}

                {upcomingMeetings.length > 0 && (
                  <div
                    aria-hidden="true"
                    style={{
                      position: "absolute",
                      left: "11px",
                      right: "11px",
                      top: "9px",
                      bottom: "-9px",
                      borderRadius: "28px",
                      backgroundColor: "#F0F3F6",
                      border: "1px solid #E5EAEF",
                    }}
                  />
                )}

                <div
                  style={{
                    position: "relative",
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #E9EDF2",
                    borderRadius: "28px",
                    padding: "36px",
                    boxShadow: "0 18px 55px rgba(17, 24, 39, 0.06)",
                  }}
                >
                  <p
                    style={{
                      margin: 0,
                      fontSize: "13px",
                      fontWeight: 700,
                      color: "#5E6A7D",
                      textTransform: "uppercase",
                      letterSpacing: "0.12em",
                    }}
                  >
                    Current Focus
                  </p>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "96px 1fr",
                      gap: "24px",
                      marginTop: "28px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "34px",
                        fontWeight: 700,
                        letterSpacing: "-1px",
                        color: "#1E3A5F",
                      }}
                    >
                      <span style={{ display: "block" }}>
                        {currentMeeting.time}
                      </span>
                      <span
                        style={{
                          display: "block",
                          marginTop: "7px",
                          color: "#728198",
                          fontSize: "13px",
                          fontWeight: 800,
                          letterSpacing: "0.04em",
                        }}
                      >
                        {formatMeetingLength(currentMeeting.durationMinutes)}
                      </span>
                    </div>

                    <div>
                      <h2
                        style={{
                          margin: 0,
                          fontSize: "34px",
                          lineHeight: 1.1,
                          letterSpacing: "-1.2px",
                        }}
                      >
                        {currentMeeting.title}
                      </h2>

                      <p
                        style={{
                          margin: "10px 0 0",
                          fontSize: "19px",
                          lineHeight: 1.5,
                          color: "#6B7280",
                        }}
                      >
                        {currentMeeting.subtitle}
                      </p>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          flexWrap: "wrap",
                          marginTop: "16px",
                        }}
                      >
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            minHeight: "36px",
                            padding: "0 14px",
                            borderRadius: "999px",
                            backgroundColor: "#EEF4FB",
                            color: "#31577D",
                            fontSize: "13px",
                            fontWeight: 800,
                          }}
                        >
                          {currentMeeting.time}–{formatClockTime(
                            meetingEndDate(currentMeeting),
                          )}
                        </span>
                        <span
                          style={{
                            color: "#667085",
                            fontSize: "14px",
                            fontWeight: 700,
                          }}
                        >
                          {formatMeetingLength(currentMeeting.durationMinutes)} ·
                          Ends {formatClockTime(meetingEndDate(currentMeeting))}
                        </span>
                      </div>

                      <div
                        style={{
                          marginTop: "28px",
                          paddingTop: "24px",
                          borderTop: "1px solid #EEF1F4",
                        }}
                      >
                        <p style={labelStyle}>Objective</p>

                        <p
                          style={{
                            margin: 0,
                            fontSize: "20px",
                            fontWeight: 600,
                            lineHeight: 1.55,
                            color: "#374151",
                          }}
                        >
                          {currentMeeting.purpose}
                        </p>
                      </div>

                      {isExpanded && (
                        <ExecutiveBrief
                          objective={currentMeeting.purpose}
                          meetingLabel={getMeetingTypeLabel(
                            currentMeeting.meetingType,
                          )}
                          destination={currentMeeting.destination}
                          action={currentAction}
                        />
                      )}

                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          gap: "14px",
                          flexWrap: "wrap",
                          marginTop: "28px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            flexWrap: "wrap",
                          }}
                        >
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "8px",
                              minHeight: "36px",
                              padding: "0 15px",
                              borderRadius: "999px",
                              backgroundColor:
                                currentDisplayStatus === "cancelled"
                                  ? "#FDECEC"
                                  : currentDisplayStatus === "in-progress"
                                    ? "#FFF4D6"
                                    : "#EAF8EE",
                              color:
                                currentDisplayStatus === "cancelled"
                                  ? "#C53030"
                                  : currentDisplayStatus === "in-progress"
                                    ? "#A66B00"
                                    : "#2E7D32",
                              fontSize: "12px",
                              fontWeight: 700,
                            }}
                          >
                            <span>{getStatusDetails(currentDisplayStatus ?? currentMeeting.status).symbol}</span>
                            <span>{getStatusDetails(currentDisplayStatus ?? currentMeeting.status).label}</span>
                          </span>

                          <span
                            style={{
                              color: "#7B8493",
                              fontSize: "13px",
                              fontWeight: 600,
                            }}
                          >
                            {timeUntilMeeting}
                          </span>
                        </div>

                        <div
                          style={{
                            width: "100%",
                            marginTop: "18px",
                            padding: "15px 16px",
                            border: "1px solid #E8EDF2",
                            borderRadius: "16px",
                            backgroundColor: "#FAFBFC",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              gap: "12px",
                              marginBottom: "10px",
                            }}
                          >
                            <span
                              style={{
                                color: "#60738A",
                                fontSize: "11px",
                                fontWeight: 800,
                                letterSpacing: "0.08em",
                                textTransform: "uppercase",
                              }}
                            >
                              Live Timeline
                            </span>

                            <span
                              style={{
                                color:
                                  currentDisplayStatus === "in-progress"
                                    ? "#A66B00"
                                    : "#7B8493",
                                fontSize: "12px",
                                fontWeight: 700,
                                textAlign: "right",
                              }}
                            >
                              {timelineLabel}
                            </span>
                          </div>

                          <div
                            aria-label={`Meeting timeline: ${Math.round(
                              timelineProgress,
                            )}%`}
                            style={{
                              position: "relative",
                              height: "10px",
                              overflow: "hidden",
                              borderRadius: "999px",
                              backgroundColor: "#E7EBF0",
                            }}
                          >
                            <div
                              style={{
                                width: `${timelineProgress}%`,
                                height: "100%",
                                borderRadius: "999px",
                                backgroundColor:
                                  currentDisplayStatus === "in-progress"
                                    ? "#D8A33D"
                                    : "#4C8A68",
                                transition: "width 1s linear",
                              }}
                            />

                            {secondsUntilStart <= 300 &&
                              currentDisplayStatus === "scheduled" && (
                                <span
                                  style={{
                                    position: "absolute",
                                    top: "50%",
                                    left: `${timelineProgress}%`,
                                    width: "14px",
                                    height: "14px",
                                    border: "3px solid #FFFFFF",
                                    borderRadius: "999px",
                                    backgroundColor: "#4C8A68",
                                    boxShadow:
                                      "0 0 0 3px rgba(76, 138, 104, 0.16)",
                                    transform: "translate(-50%, -50%)",
                                    transition: "left 1s linear",
                                  }}
                                />
                              )}
                          </div>

                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              gap: "12px",
                              marginTop: "9px",
                              color: "#929CAA",
                              fontSize: "11px",
                              fontWeight: 600,
                            }}
                          >
                            <span>
                              {isMeetingLive
                                ? `${Math.min(
                                    currentMeeting.durationMinutes,
                                    Math.max(
                                      0,
                                      Math.floor(secondsFromStart / 60),
                                    ),
                                  )} / ${currentMeeting.durationMinutes} min`
                                : secondsFromStart >= meetingDurationSeconds &&
                                    meetingDurationSeconds > 0
                                  ? `${currentMeeting.durationMinutes} / ${currentMeeting.durationMinutes} min`
                                  : secondsUntilStart > countdownWindowSeconds
                                    ? "60-minute runway"
                                    : formatDuration(secondsUntilStart)}
                            </span>
                            <span>
                              {currentMeeting.time}–{formatClockTime(
                                meetingEndDate(currentMeeting),
                              )}
                            </span>
                          </div>
                        </div>

                        <div
                          style={{
                            display: "flex",
                            gap: "10px",
                            flexWrap: "wrap",
                          }}
                        >
                          {currentAction && (
                            <a
                              href={currentAction.href}
                              target={
                                currentAction.href.startsWith("http")
                                  ? "_blank"
                                  : undefined
                              }
                              rel="noopener noreferrer"
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                padding: "13px 18px",
                                border: "1px solid #DDE3EA",
                                borderRadius: "14px",
                                backgroundColor: "#FFFFFF",
                                color: "#31577D",
                                fontSize: "15px",
                                fontWeight: 700,
                                textDecoration: "none",
                              }}
                            >
                              {currentAction.label}
                            </a>
                          )}

                          <button
                            onClick={() => openMeetingEditor(currentMeeting)}
                            style={{
                              padding: "13px 18px",
                              border: "1px solid #DDE3EA",
                              borderRadius: "14px",
                              backgroundColor: "#FFFFFF",
                              color: "#374151",
                              fontSize: "15px",
                              fontWeight: 700,
                              cursor: "pointer",
                            }}
                          >
                            Edit
                          </button>

                          <button
                            onClick={() => deleteMeeting(currentMeeting)}
                            style={{
                              padding: "13px 18px",
                              border: "1px solid #E8D9D9",
                              borderRadius: "14px",
                              backgroundColor: "#FFFFFF",
                              color: "#8A4B4B",
                              fontSize: "15px",
                              fontWeight: 700,
                              cursor: "pointer",
                            }}
                          >
                            Delete
                          </button>

                          <button
                            onClick={() =>
                              setIsExpanded((value) => !value)
                            }
                            style={{
                              padding: "13px 18px",
                              border: "1px solid #DDE3EA",
                              borderRadius: "14px",
                              backgroundColor: "#FFFFFF",
                              color: "#374151",
                              fontSize: "15px",
                              fontWeight: 700,
                              cursor: "pointer",
                            }}
                          >
                            {isExpanded ? "Close Preparation" : "Executive Brief"}
                          </button>

                          <button
                            onClick={() => setIsChoosingOutcome(true)}
                            style={{
                              padding: "13px 18px",
                              border: 0,
                              borderRadius: "14px",
                              backgroundColor: "#1E3A5F",
                              color: "#FFFFFF",
                              fontSize: "15px",
                              fontWeight: 700,
                              cursor: "pointer",
                            }}
                          >
                            Complete Session
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div
                style={{
                  marginBottom: "24px",
                  padding: "48px",
                  border: "1px solid #DDEFE4",
                  borderRadius: "28px",
                  backgroundColor: "#EDF7F1",
                  textAlign: "center",
                }}
              >
                <h2 style={{ margin: 0, fontSize: "30px" }}>
                  Today is complete.
                </h2>

                <p
                  style={{
                    margin: "12px 0 0",
                    color: "#64806E",
                    fontSize: "17px",
                  }}
                >
                  Every meeting has been added to today&apos;s journey.
                </p>

                <button
                  onClick={openMeetingCreator}
                  style={{
                    marginTop: "24px",
                    padding: "12px 18px",
                    border: 0,
                    borderRadius: "13px",
                    backgroundColor: "#1E3A5F",
                    color: "#FFFFFF",
                    fontSize: "15px",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Plan something
                </button>
              </div>
            )}

            <div
              style={{
                padding: "30px",
                border: "1px solid #E9EDF2",
                borderRadius: "24px",
                backgroundColor: "#FFFFFF",
                boxShadow: "0 12px 40px rgba(17, 24, 39, 0.045)",
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "#5E6A7D",
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                }}
              >
                Upcoming
              </p>

              {upcomingMeetings.length > 0 ? (
                <div style={{ marginTop: "18px" }}>
                  {upcomingMeetings.map((meeting, index) => {
                    const meetingHasStarted =
                      isMounted &&
                      meetingStartDate(meeting).getTime() <= nowTime;
                    const displayStatus: MeetingStatus =
                      meeting.status === "cancelled"
                        ? "cancelled"
                        : meeting.status === "in-progress" || meetingHasStarted
                          ? "in-progress"
                          : "scheduled";

                    return (
                    <div
                      key={meeting.id}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "82px 1fr auto",
                        gap: "18px",
                        alignItems: "center",
                        padding: "20px 0",
                        borderTop:
                          index === 0 ? "none" : "1px solid #EEF1F4",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "18px",
                          fontWeight: 700,
                          color: "#1E3A5F",
                        }}
                      >
                        <span style={{ display: "block" }}>
                          {meeting.time}–{formatClockTime(meetingEndDate(meeting))}
                        </span>
                        <span
                          style={{
                            display: "block",
                            marginTop: "5px",
                            color: "#8792A3",
                            fontSize: "11px",
                            fontWeight: 800,
                          }}
                        >
                          {meeting.durationMinutes} min
                        </span>
                      </div>

                      <div>
                        <p
                          style={{
                            margin: 0,
                            fontSize: "18px",
                            fontWeight: 700,
                          }}
                        >
                          {meeting.title}
                        </p>

                        <p
                          style={{
                            margin: "5px 0 0",
                            fontSize: "15px",
                            color: "#8A93A3",
                          }}
                        >
                          {meeting.subtitle}
                        </p>
                      </div>

                      <div style={{ textAlign: "right" }}>
                        <span
                          style={{
                            display: "block",
                            fontSize: "12px",
                            fontWeight: 700,
                            color: "#8792A3",
                          }}
                        >
                          {getMeetingTypeLabel(meeting.meetingType)}
                        </span>

                        <span
                          style={{
                            display: "block",
                            marginTop: "5px",
                            fontSize: "11px",
                            fontWeight: 700,
                            color: "#A0A8B4",
                          }}
                        >
                          {getCategoryLabel(meeting.category)}
                        </span>

                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "7px",
                            minHeight: "32px",
                            marginTop: "8px",
                            padding: "0 13px",
                            borderRadius: "999px",
                            backgroundColor:
                              displayStatus === "cancelled"
                                ? "#FDECEC"
                                : displayStatus === "in-progress"
                                  ? "#FFF4D6"
                                  : "#EAF8EE",
                            color:
                              displayStatus === "cancelled"
                                ? "#C53030"
                                : displayStatus === "in-progress"
                                  ? "#A66B00"
                                  : "#2E7D32",
                            fontSize: "12px",
                            fontWeight: 700,
                          }}
                        >
                          {getStatusDetails(displayStatus).symbol}{" "}
                          {getStatusDetails(displayStatus).label}
                        </span>

                        <div
                          style={{
                            display: "flex",
                            justifyContent: "flex-end",
                            gap: "10px",
                            marginTop: "8px",
                          }}
                        >
                          <button
                            onClick={() => openMeetingEditor(meeting)}
                            style={rowActionStyle}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteMeeting(meeting)}
                            style={{ ...rowActionStyle, color: "#985C5C" }}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                    );
                  })}
                </div>
              ) : (
                <p
                  style={{
                    margin: "22px 0 0",
                    color: "#9CA3AF",
                  }}
                >
                  Nothing else is waiting.
                </p>
              )}

              <button
                onClick={openMeetingCreator}
                style={{
                  width: "100%",
                  marginTop: "18px",
                  padding: "18px 0 4px",
                  border: 0,
                  borderTop: "1px solid #EEF1F4",
                  backgroundColor: "transparent",
                  color: "#31577D",
                  fontFamily: "inherit",
                  fontSize: "15px",
                  fontWeight: 700,
                  textAlign: "left",
                  cursor: "pointer",
                }}
              >
                + Add to today…
              </button>
            </div>
          </div>

          <aside
            style={{
              display: "grid",
              gap: "24px",
            }}
          >
            <div
              style={{
                padding: "30px",
                border: "1px solid #E9EDF2",
                borderRadius: "24px",
                backgroundColor: "#FFFFFF",
                boxShadow: "0 12px 40px rgba(17, 24, 39, 0.045)",
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "#5E6A7D",
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                }}
              >
                Decision Desk
              </p>

              <p
                style={{
                  margin: "26px 0 0",
                  fontSize: "17px",
                  lineHeight: 1.65,
                  color: "#7B8493",
                }}
              >
                Capture the decisions, questions, and ideas shaping the company.
              </p>

              <textarea
                value={thinking}
                onChange={(event) => setThinking(event.target.value)}
                placeholder="What needs a decision?"
                style={{
                  boxSizing: "border-box",
                  width: "100%",
                  minHeight: "180px",
                  resize: "vertical",
                  marginTop: "28px",
                  padding: "18px",
                  border: "1px solid #EDF0F3",
                  borderRadius: "18px",
                  backgroundColor: "#F7F8FA",
                  color: "#374151",
                  fontFamily: "inherit",
                  fontSize: "15px",
                  lineHeight: 1.5,
                  outline: "none",
                }}
              />
            </div>

            <div
              style={{
                padding: "30px",
                border: "1px solid #E9EDF2",
                borderRadius: "24px",
                backgroundColor: "#FFFFFF",
                boxShadow: "0 12px 40px rgba(17, 24, 39, 0.045)",
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "#5E6A7D",
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                }}
              >
                Today&apos;s Journey
              </p>

              <div style={{ marginTop: "20px" }}>
                {completed.map((meeting, index) => {
                  const result = outcomeDetails(meeting.outcome);

                  return (
                    <div
                      key={meeting.id}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "28px 52px 1fr",
                        gap: "10px",
                        alignItems: "center",
                        padding: "14px 0",
                        borderTop:
                          index === 0 ? "none" : "1px solid #EEF1F4",
                      }}
                    >
                      <span
                        style={{
                          display: "grid",
                          placeItems: "center",
                          width: "24px",
                          height: "24px",
                          borderRadius: "999px",
                          backgroundColor: "#EDF7F1",
                          color: "#4C8A68",
                          fontSize: "13px",
                          fontWeight: 700,
                        }}
                      >
                        {result.symbol}
                      </span>

                      <span
                        style={{
                          fontSize: "14px",
                          fontWeight: 600,
                          color: "#9AA2AE",
                        }}
                      >
                        {meeting.time}
                      </span>

                      <div>
                        <p
                          style={{
                            margin: 0,
                            fontSize: "15px",
                            color: "#8D96A4",
                            textDecoration: "line-through",
                          }}
                        >
                          {meeting.title}
                        </p>

                        <p
                          style={{
                            margin: "4px 0 0",
                            fontSize: "12px",
                            fontWeight: 700,
                            color: "#779083",
                          }}
                        >
                          {result.label}
                        </p>

                        <p
                          style={{
                            margin: "4px 0 0",
                            color: "#9AA2AE",
                            fontSize: "11px",
                            fontWeight: 600,
                          }}
                        >
                          {meeting.time}–{formatClockTime(
                            meetingEndDate(meeting),
                          )} · {meeting.durationMinutes} min
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </aside>
        </section>
      </div>

      {isCreatingMeeting && (
        <div
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) {
              closeMeetingCreator();
            }
          }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 50,
            display: "grid",
            placeItems: "center",
            padding: "24px",
            backgroundColor: "rgba(17, 24, 39, 0.42)",
            backdropFilter: "blur(7px)",
          }}
        >
          <form
            onSubmit={createMeeting}
            style={{
              boxSizing: "border-box",
              width: "100%",
              maxWidth: "620px",
              maxHeight: "90vh",
              overflowY: "auto",
              padding: "38px",
              borderRadius: "28px",
              backgroundColor: "#FFFFFF",
              boxShadow: "0 30px 90px rgba(17, 24, 39, 0.22)",
            }}
          >
            <p style={labelStyle}>{editingMeetingId ? "Edit meeting" : "New meeting"}</p>

            <h2
              style={{
                margin: "12px 0 0",
                fontSize: "32px",
                letterSpacing: "-0.8px",
              }}
            >
              {editingMeetingId ? "Update this meeting" : "What are we planning?"}
            </h2>

            <div style={{ marginTop: "30px" }}>
              <label style={labelStyle}>Meeting title</label>

              <input
                autoFocus
                value={newMeeting.title}
                onChange={(event) =>
                  setNewMeeting((previous) => ({
                    ...previous,
                    title: event.target.value,
                  }))
                }
                placeholder="Cherry Ventures"
                style={inputStyle}
              />
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: "16px",
                marginTop: "20px",
              }}
            >
              <div>
                <label style={labelStyle}>Date</label>

                <input
                  type="date"
                  value={newMeeting.date}
                  onChange={(event) =>
                    setNewMeeting((previous) => ({
                      ...previous,
                      date: event.target.value,
                    }))
                  }
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Time</label>

                <input
                  type="time"
                  value={newMeeting.time}
                  onChange={(event) =>
                    setNewMeeting((previous) => ({
                      ...previous,
                      time: event.target.value,
                    }))
                  }
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Duration</label>

                <select
                  value={newMeeting.durationMinutes}
                  onChange={(event) =>
                    setNewMeeting((previous) => ({
                      ...previous,
                      durationMinutes: Number(event.target.value),
                    }))
                  }
                  style={inputStyle}
                >
                  {meetingDurations.map((duration) => (
                    <option key={duration} value={duration}>
                      {duration} minutes
                    </option>
                  ))}
                </select>

                {newMeeting.time && (
                  <span
                    style={{
                      display: "block",
                      marginTop: "7px",
                      color: "#7B8493",
                      fontSize: "12px",
                      fontWeight: 700,
                    }}
                  >
                    Ends{" "}
                    {formatClockTime(
                      meetingEndDate({
                        date: newMeeting.date,
                        time: newMeeting.time,
                        durationMinutes: newMeeting.durationMinutes,
                      }),
                    )}
                  </span>
                )}
              </div>
            </div>

            <div style={{ marginTop: "22px" }}>
              <label style={labelStyle}>Meeting category</label>

              <select
                value={newMeeting.category}
                onChange={(event) =>
                  setNewMeeting((previous) => ({
                    ...previous,
                    category: event.target.value as MeetingCategory,
                  }))
                }
                style={inputStyle}
              >
                {meetingCategories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginTop: "22px" }}>
              <label style={labelStyle}>Meeting status</label>

              <select
                value={newMeeting.status}
                onChange={(event) =>
                  setNewMeeting((previous) => ({
                    ...previous,
                    status: event.target.value as MeetingStatus,
                  }))
                }
                style={inputStyle}
              >
                {meetingStatuses.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginTop: "22px" }}>
              <label style={labelStyle}>Meeting type</label>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "10px",
                }}
              >
                {meetingTypes.map((meetingType) => {
                  const selected =
                    newMeeting.meetingType === meetingType.value;

                  return (
                    <button
                      key={meetingType.value}
                      type="button"
                      onClick={() =>
                        setNewMeeting((previous) => ({
                          ...previous,
                          meetingType: meetingType.value,
                          destination: "",
                        }))
                      }
                      style={{
                        padding: "13px 10px",
                        border: selected
                          ? "1px solid #31577D"
                          : "1px solid #E1E6EC",
                        borderRadius: "13px",
                        backgroundColor: selected
                          ? "#EEF4FB"
                          : "#FFFFFF",
                        color: selected ? "#244B73" : "#667085",
                        fontSize: "13px",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      {meetingType.symbol} {meetingType.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ marginTop: "20px" }}>
              <label style={labelStyle}>
                {destinationLabel(newMeeting.meetingType)}
              </label>

              <input
                value={newMeeting.destination}
                onChange={(event) => {
                  const destination = event.target.value;
                  const detectedType = detectMeetingType(destination);

                  setNewMeeting((previous) => ({
                    ...previous,
                    destination,
                    meetingType: detectedType ?? previous.meetingType,
                  }));
                }}
                placeholder={destinationPlaceholder(
                  newMeeting.meetingType,
                )}
                style={inputStyle}
              />
            </div>

            <div style={{ marginTop: "20px" }}>
              <label style={labelStyle}>Success looks like</label>

              <textarea
                value={newMeeting.purpose}
                onChange={(event) =>
                  setNewMeeting((previous) => ({
                    ...previous,
                    purpose: event.target.value,
                  }))
                }
                placeholder="What should this meeting achieve?"
                style={{
                  ...inputStyle,
                  minHeight: "92px",
                  resize: "vertical",
                }}
              />
            </div>

            <div style={{ marginTop: "20px" }}>
              <label style={labelStyle}>Founder participants</label>

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "10px",
                }}
              >
                <button
                  type="button"
                  onClick={toggleAllFounders}
                  style={{
                    padding: "12px 15px",
                    border:
                      newMeeting.founderAttendees.length === founders.length
                        ? "1px solid #31577D"
                        : "1px solid #E1E6EC",
                    borderRadius: "13px",
                    backgroundColor:
                      newMeeting.founderAttendees.length === founders.length
                        ? "#EEF4FB"
                        : "#FFFFFF",
                    color:
                      newMeeting.founderAttendees.length === founders.length
                        ? "#244B73"
                        : "#667085",
                    fontSize: "13px",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Founders
                </button>

                {founders.map((founder) => {
                  const selected =
                    newMeeting.founderAttendees.includes(founder);

                  return (
                    <button
                      key={founder}
                      type="button"
                      onClick={() => toggleFounder(founder)}
                      style={{
                        padding: "12px 15px",
                        border: selected
                          ? "1px solid #31577D"
                          : "1px solid #E1E6EC",
                        borderRadius: "13px",
                        backgroundColor: selected
                          ? "#EEF4FB"
                          : "#FFFFFF",
                        color: selected ? "#244B73" : "#667085",
                        fontSize: "13px",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      {founder}
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ marginTop: "20px" }}>
              <label style={labelStyle}>Other participants</label>

              <input
                value={newMeeting.otherAttendees}
                onChange={(event) =>
                  setNewMeeting((previous) => ({
                    ...previous,
                    otherAttendees: event.target.value,
                  }))
                }
                placeholder="Cherry VC, Yan Hui, legal counsel..."
                style={inputStyle}
              />
            </div>

            {formError && (
              <p
                style={{
                  margin: "18px 0 0",
                  padding: "12px 14px",
                  borderRadius: "12px",
                  backgroundColor: "#FFF2F2",
                  color: "#A94444",
                  fontSize: "14px",
                }}
              >
                {formError}
              </p>
            )}

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "12px",
                marginTop: "30px",
                paddingTop: "24px",
                borderTop: "1px solid #EEF1F4",
              }}
            >
              <button
                type="button"
                onClick={closeMeetingCreator}
                style={{
                  padding: "13px 18px",
                  border: "1px solid #DDE3EA",
                  borderRadius: "14px",
                  backgroundColor: "#FFFFFF",
                  color: "#4B5563",
                  fontSize: "15px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>

              <button
                type="submit"
                style={{
                  padding: "13px 20px",
                  border: 0,
                  borderRadius: "14px",
                  backgroundColor: "#1E3A5F",
                  color: "#FFFFFF",
                  fontSize: "15px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                {editingMeetingId ? "Save changes" : "Add to Atlas"}
              </button>
            </div>
          </form>
        </div>
      )}

      {isChoosingOutcome && currentMeeting && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 60,
            display: "grid",
            placeItems: "center",
            padding: "24px",
            backgroundColor: "rgba(17, 24, 39, 0.42)",
            backdropFilter: "blur(7px)",
          }}
        >
          <div
            style={{
              boxSizing: "border-box",
              width: "100%",
              maxWidth: "520px",
              padding: "36px",
              borderRadius: "28px",
              backgroundColor: "#FFFFFF",
              boxShadow: "0 30px 90px rgba(17, 24, 39, 0.22)",
            }}
          >
            <p style={labelStyle}>Meeting outcome</p>

            <h2
              style={{
                margin: "12px 0 0",
                fontSize: "32px",
                letterSpacing: "-0.8px",
              }}
            >
              How did it go?
            </h2>

            <p
              style={{
                margin: "10px 0 0",
                color: "#7B8493",
                fontSize: "16px",
              }}
            >
              Did the meeting achieve what you intended?
            </p>

            <div
              style={{
                display: "grid",
                gap: "10px",
                marginTop: "28px",
              }}
            >
              {[
                {
                  value: "achieved" as MeetingOutcome,
                  label: "Achieved",
                  description: "The intended outcome was reached.",
                  symbol: "✓",
                },
                {
                  value: "partial" as MeetingOutcome,
                  label: "Partial",
                  description: "Progress was made, but work remains.",
                  symbol: "◐",
                },
                {
                  value: "follow-up" as MeetingOutcome,
                  label: "Needs follow-up",
                  description: "A new action or conversation is required.",
                  symbol: "→",
                },
                {
                  value: "rescheduled" as MeetingOutcome,
                  label: "Rescheduled",
                  description: "The meeting will happen at another time.",
                  symbol: "↻",
                },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => recordOutcome(option.value)}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "38px 1fr",
                    gap: "12px",
                    alignItems: "center",
                    width: "100%",
                    padding: "16px",
                    border: "1px solid #E3E8EE",
                    borderRadius: "15px",
                    backgroundColor: "#FFFFFF",
                    textAlign: "left",
                    cursor: "pointer",
                  }}
                >
                  <span
                    style={{
                      display: "grid",
                      placeItems: "center",
                      width: "34px",
                      height: "34px",
                      borderRadius: "999px",
                      backgroundColor: "#F1F5F8",
                      color: "#31577D",
                      fontSize: "16px",
                      fontWeight: 700,
                    }}
                  >
                    {option.symbol}
                  </span>

                  <span>
                    <strong
                      style={{
                        display: "block",
                        color: "#243244",
                        fontSize: "15px",
                      }}
                    >
                      {option.label}
                    </strong>

                    <span
                      style={{
                        display: "block",
                        marginTop: "3px",
                        color: "#8A93A3",
                        fontSize: "13px",
                      }}
                    >
                      {option.description}
                    </span>
                  </span>
                </button>
              ))}
            </div>

            <button
              onClick={() => setIsChoosingOutcome(false)}
              style={{
                width: "100%",
                marginTop: "18px",
                padding: "12px",
                border: 0,
                backgroundColor: "transparent",
                color: "#7B8493",
                fontSize: "14px",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Return to meeting
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
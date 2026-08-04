"use client";

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

export type UpcomingMeeting = {
  id: string | number;
  date: string;
  time: string;
  durationMinutes: number;
  title: string;
  subtitle: string;
  meetingType: MeetingType;
  category: MeetingCategory;
  status: MeetingStatus;
};

type UpcomingProps = {
  meetings: UpcomingMeeting[];
  now: Date | null;
  isMounted: boolean;
  onAddMeeting: () => void;
  onEditMeeting: (meeting: UpcomingMeeting) => void;
  onDeleteMeeting: (meeting: UpcomingMeeting) => void;
  getMeetingTypeLabel: (type: MeetingType) => string;
  getCategoryLabel: (category: MeetingCategory) => string;
};

function meetingDateOnly(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function meetingStartDate(meeting: Pick<UpcomingMeeting, "date" | "time">) {
  const [year, month, day] = meeting.date.split("-").map(Number);
  const [hour, minute] = meeting.time.split(":").map(Number);
  return new Date(year, month - 1, day, hour, minute, 0, 0);
}

function meetingEndDate(
  meeting: Pick<UpcomingMeeting, "date" | "time" | "durationMinutes">,
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

function getRelativeMeetingDate(date: string, currentDate: Date | null) {
  if (!currentDate) return "Upcoming";

  const meetingDay = meetingDateOnly(date);
  const today = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    currentDate.getDate(),
  );

  const differenceInDays = Math.round(
    (meetingDay.getTime() - today.getTime()) / 86_400_000,
  );

  if (differenceInDays === 0) return "Today";
  if (differenceInDays === 1) return "Tomorrow";

  return new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
  }).format(meetingDay);
}

function getFullMeetingDate(date: string) {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(meetingDateOnly(date));
}

function statusDetails(status: MeetingStatus) {
  switch (status) {
    case "cancelled":
      return {
        label: "Cancelled",
        symbol: "×",
        backgroundColor: "#FDECEC",
        color: "#C53030",
      };
    case "in-progress":
      return {
        label: "In Progress",
        symbol: "◐",
        backgroundColor: "#FFF4D6",
        color: "#A66B00",
      };
    default:
      return {
        label: "Scheduled",
        symbol: "●",
        backgroundColor: "#EAF8EE",
        color: "#2E7D32",
      };
  }
}

export default function Upcoming({
  meetings,
  now,
  isMounted,
  onAddMeeting,
  onEditMeeting,
  onDeleteMeeting,
  getMeetingTypeLabel,
  getCategoryLabel,
}: UpcomingProps) {
  const nowTime = now?.getTime() ?? 0;

  return (
    <section style={cardStyle}>
      <div style={headerStyle}>
        <p style={labelStyle}>Upcoming</p>
        <span style={countStyle}>{meetings.length}</span>
      </div>

      {meetings.length > 0 ? (
        <div style={{ marginTop: "18px" }}>
          {meetings.map((meeting, index) => {
            const meetingHasStarted =
              isMounted && meetingStartDate(meeting).getTime() <= nowTime;
            const displayStatus: MeetingStatus =
              meeting.status === "cancelled"
                ? "cancelled"
                : meeting.status === "in-progress" || meetingHasStarted
                  ? "in-progress"
                  : "scheduled";
            const status = statusDetails(displayStatus);

            return (
              <article
                key={meeting.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "150px minmax(0, 1fr) auto",
                  gap: "22px",
                  alignItems: "center",
                  padding: "24px 0",
                  borderTop: index === 0 ? "none" : "1px solid #EEF1F4",
                }}
              >
                <div>
                  <p style={relativeDateStyle}>
                    {getRelativeMeetingDate(meeting.date, now)}
                  </p>
                  <p style={fullDateStyle}>
                    {getFullMeetingDate(meeting.date)}
                  </p>
                  <p style={timeStyle}>
                    {meeting.time}–{formatClockTime(meetingEndDate(meeting))}
                  </p>
                  <p style={durationStyle}>{meeting.durationMinutes} min</p>
                </div>

                <div style={{ minWidth: 0 }}>
                  <p style={titleStyle}>{meeting.title}</p>
                  <p style={subtitleStyle}>{meeting.subtitle}</p>
                  <p style={metaStyle}>
                    {getMeetingTypeLabel(meeting.meetingType)} ·{" "}
                    {getCategoryLabel(meeting.category)}
                  </p>
                </div>

                <div style={{ textAlign: "right" }}>
                  <span
                    style={{
                      ...statusStyle,
                      backgroundColor: status.backgroundColor,
                      color: status.color,
                    }}
                  >
                    {status.symbol} {status.label}
                  </span>
                  <div style={actionsStyle}>
                    <button
                      type="button"
                      onClick={() => onEditMeeting(meeting)}
                      style={rowActionStyle}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteMeeting(meeting)}
                      style={{ ...rowActionStyle, color: "#985C5C" }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <p style={emptyTextStyle}>Nothing else is waiting.</p>
      )}

      <button type="button" onClick={onAddMeeting} style={addButtonStyle}>
        + Add to today…
      </button>
    </section>
  );
}

const cardStyle = {
  padding: "30px",
  border: "1px solid #E9EDF2",
  borderRadius: "24px",
  backgroundColor: "#FFFFFF",
  boxShadow: "0 12px 40px rgba(17, 24, 39, 0.045)",
};

const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const labelStyle = {
  margin: 0,
  fontSize: "13px",
  fontWeight: 700,
  color: "#5E6A7D",
  textTransform: "uppercase" as const,
  letterSpacing: "0.12em",
};

const countStyle = {
  display: "grid",
  placeItems: "center",
  minWidth: "28px",
  height: "28px",
  padding: "0 7px",
  borderRadius: "999px",
  backgroundColor: "#EFF4F9",
  color: "#31577D",
  fontSize: "12px",
  fontWeight: 800,
};

const relativeDateStyle = {
  margin: 0,
  fontSize: "14px",
  fontWeight: 800,
  color: "#31577D",
};

const fullDateStyle = {
  margin: "4px 0 0",
  fontSize: "12px",
  lineHeight: 1.4,
  color: "#8792A3",
};

const timeStyle = {
  margin: "12px 0 0",
  fontSize: "17px",
  fontWeight: 700,
  color: "#1E3A5F",
};

const durationStyle = {
  margin: "4px 0 0",
  color: "#A0A8B4",
  fontSize: "11px",
  fontWeight: 800,
};

const titleStyle = {
  margin: 0,
  overflow: "hidden",
  textOverflow: "ellipsis",
  fontSize: "18px",
  fontWeight: 700,
  color: "#1F2937",
};

const subtitleStyle = {
  margin: "6px 0 0",
  fontSize: "15px",
  lineHeight: 1.45,
  color: "#8A93A3",
};

const metaStyle = {
  margin: "10px 0 0",
  fontSize: "12px",
  fontWeight: 700,
  color: "#60738A",
};

const statusStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: "7px",
  minHeight: "32px",
  padding: "0 13px",
  borderRadius: "999px",
  whiteSpace: "nowrap" as const,
  fontSize: "12px",
  fontWeight: 700,
};

const actionsStyle = {
  display: "flex",
  justifyContent: "flex-end",
  gap: "10px",
  marginTop: "10px",
};

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

const emptyTextStyle = {
  margin: "22px 0 0",
  color: "#9CA3AF",
};

const addButtonStyle = {
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
  textAlign: "left" as const,
  cursor: "pointer",
};

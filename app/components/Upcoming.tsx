import {
  Meeting,
  MeetingCategory,
  MeetingStatus,
  MeetingType,
} from "../types";

type UpcomingProps = {
  meetings: Meeting[];
  now: Date | null;
  isMounted: boolean;
  onAddMeeting: () => void;
  onEditMeeting: (meeting: Meeting) => void;
  onDeleteMeeting: (meeting: Meeting) => void | Promise<void>;
  getMeetingTypeLabel: (type: MeetingType) => string;
  getCategoryLabel: (category: MeetingCategory) => string;
};

function parseMeetingDate(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(year, month - 1, day);
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

function getRelativeDateLabel(date: string, now: Date | null) {
  if (!now) return "";

  const meetingDate = parseMeetingDate(date);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const differenceInDays = Math.round(
    (meetingDate.getTime() - today.getTime()) / 86_400_000,
  );

  if (differenceInDays === 0) return "Today";
  if (differenceInDays === 1) return "Tomorrow";
  if (differenceInDays > 1) return `In ${differenceInDays} days`;

  return "Earlier";
}

function getFullDateLabel(date: string) {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(parseMeetingDate(date));
}

function getDisplayStatus(
  meeting: Meeting,
  now: Date | null,
  isMounted: boolean,
): MeetingStatus {
  if (meeting.status === "cancelled") return "cancelled";
  if (!isMounted || !now) return meeting.status;

  const meetingHasStarted =
    meetingStartDate(meeting).getTime() <= now.getTime();

  if (meeting.status === "in-progress" || meetingHasStarted) {
    return "in-progress";
  }

  return "scheduled";
}

function getStatusDetails(status: MeetingStatus) {
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
  return (
    <section style={cardStyle}>
      <div style={headerStyle}>
        <p style={labelStyle}>Upcoming</p>
        <span style={countStyle}>{meetings.length}</span>
      </div>

      <div style={{ marginTop: 16 }}>
        {meetings.length > 0 ? (
          meetings.map((meeting, index) => {
            const displayStatus = getDisplayStatus(
              meeting,
              now,
              isMounted,
            );

            const statusDetails = getStatusDetails(displayStatus);

            return (
              <article
                key={meeting.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "145px 1fr auto",
                  gap: 22,
                  alignItems: "center",
                  padding: "22px 0",
                  borderTop:
                    index === 0 ? "none" : "1px solid #EDF0F3",
                }}
              >
                <div>
                  <p style={relativeDateStyle}>
                    {getRelativeDateLabel(meeting.date, now)}
                  </p>

                  <p style={fullDateStyle}>
                    {getFullDateLabel(meeting.date)}
                  </p>

                  <p style={timeStyle}>
                    {meeting.time}–
                    {formatClockTime(meetingEndDate(meeting))}
                  </p>

                  <p style={durationStyle}>
                    {meeting.durationMinutes} min
                  </p>
                </div>

                <div>
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
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 7,
                      minHeight: 32,
                      padding: "0 13px",
                      borderRadius: 999,
                      backgroundColor:
                        statusDetails.backgroundColor,
                      color: statusDetails.color,
                      fontSize: 12,
                      fontWeight: 700,
                    }}
                  >
                    {statusDetails.symbol} {statusDetails.label}
                  </span>

                  <div style={actionsStyle}>
                    <button
                      type="button"
                      onClick={() => onEditMeeting(meeting)}
                      style={editButtonStyle}
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => onDeleteMeeting(meeting)}
                      style={deleteButtonStyle}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            );
          })
        ) : (
          <p style={emptyTextStyle}>Nothing else is waiting.</p>
        )}
      </div>

      <button
        type="button"
        onClick={onAddMeeting}
        style={addButtonStyle}
      >
        + Add to today
      </button>
    </section>
  );
}

const cardStyle = {
  padding: 26,
  border: "1px solid #E3E7EC",
  borderRadius: 24,
  backgroundColor: "#FFFFFF",
  boxShadow: "0 12px 38px rgba(30, 58, 95, 0.055)",
};

const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const labelStyle = {
  margin: 0,
  fontSize: 12,
  fontWeight: 800,
  color: "#59667A",
  textTransform: "uppercase" as const,
  letterSpacing: "0.15em",
};

const countStyle = {
  display: "grid",
  placeItems: "center",
  minWidth: 28,
  height: 28,
  borderRadius: 999,
  backgroundColor: "#EFF4F9",
  color: "#31577D",
  fontSize: 12,
  fontWeight: 800,
};

const relativeDateStyle = {
  margin: 0,
  fontSize: 13,
  fontWeight: 800,
  color: "#31577D",
};

const fullDateStyle = {
  margin: "3px 0 0",
  fontSize: 12,
  lineHeight: 1.4,
  color: "#7B8794",
};

const timeStyle = {
  margin: "12px 0 0",
  fontSize: 16,
  fontWeight: 800,
  color: "#1E3A5F",
};

const durationStyle = {
  margin: "4px 0 0",
  color: "#9AA3B0",
  fontSize: 11,
  fontWeight: 800,
};

const titleStyle = {
  margin: 0,
  fontSize: 17,
  fontWeight: 720,
  color: "#253044",
};

const subtitleStyle = {
  margin: "5px 0 0",
  fontSize: 13,
  lineHeight: 1.45,
  color: "#8993A2",
};

const metaStyle = {
  margin: "10px 0 0",
  fontSize: 11,
  fontWeight: 800,
  color: "#60738A",
};

const actionsStyle = {
  display: "flex",
  justifyContent: "flex-end",
  gap: 10,
  marginTop: 9,
};

const editButtonStyle = {
  padding: 0,
  border: 0,
  backgroundColor: "transparent",
  color: "#60738A",
  fontFamily: "inherit",
  fontSize: 11,
  fontWeight: 700,
  cursor: "pointer",
};

const deleteButtonStyle = {
  ...editButtonStyle,
  color: "#985C5C",
};

const emptyTextStyle = {
  margin: "20px 0",
  color: "#A0A7B2",
  fontSize: 14,
};

const addButtonStyle = {
  width: "100%",
  marginTop: 8,
  padding: "16px 0 0",
  border: 0,
  borderTop: "1px solid #EDF0F3",
  backgroundColor: "transparent",
  color: "#31577D",
  fontFamily: "inherit",
  fontSize: 14,
  fontWeight: 800,
  textAlign: "left" as const,
  cursor: "pointer",
};
import { Meeting, MeetingType } from "../types";

type UpcomingProps = {
  meetings: Meeting[];
  getMeetingTypeLabel: (type: MeetingType) => string;
  onAddMeeting: () => void;
};

export default function Upcoming({
  meetings,
  getMeetingTypeLabel,
  onAddMeeting,
}: UpcomingProps) {
  return (
    <section style={cardStyle}>
      <div style={headerStyle}>
        <p style={labelStyle}>Upcoming</p>
        <span style={countStyle}>{meetings.length}</span>
      </div>

      <div style={{ marginTop: 16 }}>
        {meetings.length > 0 ? (
          meetings.map((meeting, index) => (
            <div
              key={meeting.id}
              style={{
                padding: "17px 0",
                borderTop: index === 0 ? "none" : "1px solid #EDF0F3",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <span style={timeStyle}>{meeting.time}</span>
                <span style={typeStyle}>
                  {getMeetingTypeLabel(meeting.meetingType)}
                </span>
              </div>
              <p style={titleStyle}>{meeting.title}</p>
              <p style={subtitleStyle}>{meeting.subtitle}</p>
            </div>
          ))
        ) : (
          <p style={emptyTextStyle}>Nothing else is waiting.</p>
        )}
      </div>

      <button onClick={onAddMeeting} style={addButtonStyle}>
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

const timeStyle = {
  fontSize: 14,
  fontWeight: 800,
  color: "#1E3A5F",
};

const typeStyle = {
  fontSize: 10,
  fontWeight: 800,
  color: "#9AA3B0",
  textTransform: "uppercase" as const,
  letterSpacing: "0.1em",
};

const titleStyle = {
  margin: "9px 0 0",
  fontSize: 16,
  fontWeight: 720,
  color: "#253044",
};

const subtitleStyle = {
  margin: "5px 0 0",
  fontSize: 13,
  lineHeight: 1.45,
  color: "#8993A2",
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
  fontSize: 14,
  fontWeight: 800,
  textAlign: "left" as const,
  cursor: "pointer",
};

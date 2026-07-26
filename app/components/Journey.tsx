import { Meeting, MeetingOutcome } from "../types";

type JourneyProps = {
  meetings: Meeting[];
  outcomeDetails: (outcome?: MeetingOutcome) => {
    label: string;
    symbol: string;
  };
};

export default function Journey({
  meetings,
  outcomeDetails,
}: JourneyProps) {
  return (
    <section style={cardStyle}>
      <p style={labelStyle}>Today&apos;s Journey</p>

      <div style={{ marginTop: 18 }}>
        {meetings.length === 0 ? (
          <p style={emptyTextStyle}>Completed meetings will appear here.</p>
        ) : (
          meetings.map((meeting, index) => {
            const result = outcomeDetails(meeting.outcome);

            return (
              <div
                key={meeting.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "28px 1fr",
                  gap: 12,
                  alignItems: "start",
                  padding: "15px 0",
                  borderTop: index === 0 ? "none" : "1px solid #EDF0F3",
                }}
              >
                <span style={iconStyle}>{result.symbol}</span>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                    <p style={titleStyle}>{meeting.title}</p>
                    <span style={timeStyle}>{meeting.time}</span>
                  </div>
                  <p style={resultStyle}>{result.label}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
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

const labelStyle = {
  margin: 0,
  fontSize: 12,
  fontWeight: 800,
  color: "#59667A",
  textTransform: "uppercase" as const,
  letterSpacing: "0.15em",
};

const emptyTextStyle = {
  margin: "18px 0 0",
  color: "#A0A7B2",
  fontSize: 14,
};

const iconStyle = {
  display: "grid",
  placeItems: "center",
  width: 24,
  height: 24,
  borderRadius: 999,
  backgroundColor: "#E9F4ED",
  color: "#557764",
  fontSize: 12,
  fontWeight: 800,
};

const titleStyle = {
  margin: 0,
  fontSize: 14,
  fontWeight: 700,
  color: "#647083",
};

const timeStyle = {
  fontSize: 12,
  fontWeight: 700,
  color: "#A0A7B2",
};

const resultStyle = {
  margin: "5px 0 0",
  fontSize: 11,
  fontWeight: 800,
  color: "#668170",
  textTransform: "uppercase" as const,
  letterSpacing: "0.08em",
};

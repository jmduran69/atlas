import ExecutiveBrief from "./ExecutiveBrief";
import { Meeting } from "../types";

type ActionDetails = {
  label: string;
  href: string;
  symbol: string;
} | null;

type CurrentFocusProps = {
  meeting?: Meeting;
  participants: string;
  action: ActionDetails;
  timeUntilMeeting: string;
  onComplete: () => void;
  onPlanMeeting: () => void;
};

export default function CurrentFocus({
  meeting,
  participants,
  action,
  timeUntilMeeting,
  onComplete,
  onPlanMeeting,
}: CurrentFocusProps) {
  if (!meeting) {
    return (
      <section style={emptyStyle}>
        <p style={eyebrowStyle}>Current Focus</p>
        <h2 style={{ margin: "16px 0 0", fontSize: 30, letterSpacing: "-0.8px" }}>
          Today is complete.
        </h2>
        <p style={{ margin: "10px 0 0", color: "#6E7A70", fontSize: 16, lineHeight: 1.6 }}>
          Every scheduled session has been added to today&apos;s journey.
        </p>
        <button onClick={onPlanMeeting} style={{ ...primaryButtonStyle, marginTop: 24 }}>
          Plan something
        </button>
      </section>
    );
  }

  return (
    <section style={focusCardStyle}>
      <div style={topLineStyle}>
        <p style={eyebrowStyle}>Current Focus</p>
        <span style={timePillStyle}>{timeUntilMeeting}</span>
      </div>

      <div className="atlas-focus-grid" style={focusGridStyle}>
        <div style={timeStyle}>{meeting.time}</div>

        <div>
          <h2 style={titleStyle}>{meeting.title}</h2>
          <p style={subtitleStyle}>{meeting.subtitle}</p>

          <div style={objectiveBlockStyle}>
            <p style={miniLabelStyle}>Objective</p>
            <p style={objectiveTextStyle}>{meeting.purpose}</p>
          </div>

          <ExecutiveBrief
  objective={meeting.purpose}
  meetingLabel={meeting.meetingType}
  destination={meeting.destination}
  participants={participants}
  action={action}
/>

          <div style={actionRowStyle}>
            {action && (
              <a
                href={action.href}
                target={action.href.startsWith("http") ? "_blank" : undefined}
                rel="noopener noreferrer"
                style={secondaryButtonStyle}
              >
                {action.symbol} {action.label}
              </a>
            )}

            <button onClick={onComplete} style={primaryButtonStyle}>
              Complete Session
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

const focusCardStyle = {
  padding: 38,
  border: "1px solid #E3E7EC",
  borderRadius: 30,
  background:
    "linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(252,253,254,1) 100%)",
  boxShadow: "0 22px 65px rgba(30, 58, 95, 0.09)",
};

const emptyStyle = {
  padding: 44,
  border: "1px solid #DDEBE2",
  borderRadius: 30,
  backgroundColor: "#F1F8F4",
  boxShadow: "0 18px 50px rgba(30, 58, 95, 0.05)",
};

const topLineStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 16,
  flexWrap: "wrap" as const,
};

const focusGridStyle = {
  display: "grid",
  gridTemplateColumns: "112px minmax(0, 1fr)",
  gap: 30,
  marginTop: 32,
};

const eyebrowStyle = {
  margin: 0,
  fontSize: 12,
  fontWeight: 800,
  color: "#59667A",
  textTransform: "uppercase" as const,
  letterSpacing: "0.16em",
};

const miniLabelStyle = {
  margin: 0,
  fontSize: 11,
  fontWeight: 800,
  color: "#8892A1",
  textTransform: "uppercase" as const,
  letterSpacing: "0.14em",
};

const timeStyle = {
  fontSize: 36,
  fontWeight: 750,
  letterSpacing: "-1.4px",
  color: "#1E3A5F",
};

const titleStyle = {
  margin: 0,
  fontSize: 40,
  lineHeight: 1.08,
  fontWeight: 720,
  letterSpacing: "-1.6px",
  color: "#172033",
};

const subtitleStyle = {
  margin: "11px 0 0",
  fontSize: 19,
  lineHeight: 1.55,
  color: "#737D8C",
};

const objectiveBlockStyle = {
  marginTop: 28,
  paddingTop: 24,
  borderTop: "1px solid #E9EDF2",
};

const objectiveTextStyle = {
  margin: "9px 0 0",
  maxWidth: 760,
  fontSize: 21,
  fontWeight: 620,
  lineHeight: 1.55,
  color: "#354255",
};

const actionRowStyle = {
  display: "flex",
  justifyContent: "flex-end",
  gap: 12,
  flexWrap: "wrap" as const,
  marginTop: 26,
};

const timePillStyle = {
  display: "inline-flex",
  alignItems: "center",
  minHeight: 36,
  padding: "0 13px",
  borderRadius: 999,
  backgroundColor: "#EFF4F9",
  color: "#31577D",
  fontSize: 13,
  fontWeight: 700,
};

const primaryButtonStyle = {
  padding: "13px 18px",
  border: 0,
  borderRadius: 14,
  backgroundColor: "#1E3A5F",
  color: "#FFFFFF",
  fontSize: 14,
  fontWeight: 750,
  cursor: "pointer",
};

const secondaryButtonStyle = {
  display: "inline-flex",
  alignItems: "center",
  padding: "13px 18px",
  border: "1px solid #D8E0E8",
  borderRadius: 14,
  backgroundColor: "#FFFFFF",
  color: "#31577D",
  fontSize: 14,
  fontWeight: 750,
  textDecoration: "none",
};

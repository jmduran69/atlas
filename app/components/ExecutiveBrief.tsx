type ExecutiveBriefAction = {
  label: string;
  href: string;
  symbol: string;
};

type ExecutiveBriefProps = {
  objective: string;
  meetingLabel: string;
  destination: string;
  participants?: string;
  action: ExecutiveBriefAction | null;
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

export default function ExecutiveBrief({
  objective,
  meetingLabel,
  destination,
  participants,
  action,
}: ExecutiveBriefProps) {
  return (
    <div
      style={{
        marginTop: "26px",
        padding: "22px",
        borderRadius: "18px",
        backgroundColor: "#F7F8FA",
        border: "1px solid #E9EDF2",
      }}
    >
      <p style={labelStyle}>Executive Brief</p>

      <p style={labelStyle}>Today&apos;s Objective</p>

      <p
        style={{
          margin: "8px 0 22px 0",
          fontSize: "16px",
          lineHeight: 1.6,
          color: "#374151",
        }}
      >
        {objective}
      </p>

      <p
        style={{
          ...labelStyle,
          marginTop: "22px",
        }}
      >
        Meeting
      </p>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "16px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <p
            style={{
              margin: 0,
              fontSize: "16px",
              fontWeight: 700,
              color: "#374151",
            }}
          >
            {meetingLabel}
          </p>

          {destination && (
            <p
              style={{
                margin: "5px 0 0",
                fontSize: "14px",
                color: "#8A93A3",
                overflowWrap: "anywhere",
              }}
            >
              {destination}
            </p>
          )}
        </div>

        {action && (
          <a
            href={action.href}
            target={action.href.startsWith("http") ? "_blank" : undefined}
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "9px",
              padding: "12px 16px",
              borderRadius: "13px",
              backgroundColor: "#EEF4FB",
              color: "#244B73",
              fontSize: "14px",
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            <span>{action.symbol}</span>
            {action.label}
          </a>
        )}
      </div>
    </div>
  );
}

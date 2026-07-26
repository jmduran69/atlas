type DecisionDeskProps = {
  value: string;
  onChange: (value: string) => void;
};

export default function DecisionDesk({ value, onChange }: DecisionDeskProps) {
  return (
    <section style={cardStyle}>
      <p style={labelStyle}>Decision Desk</p>
      <p style={introStyle}>
        Capture the decision that most needs founder attention.
      </p>

      <div style={notebookStyle}>
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="What needs a decision?"
          style={textareaStyle}
        />
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

const introStyle = {
  margin: "14px 0 0",
  fontSize: 14,
  lineHeight: 1.55,
  color: "#8A94A3",
};

const notebookStyle = {
  marginTop: 18,
  padding: 4,
  borderRadius: 18,
  background:
    "repeating-linear-gradient(to bottom, #F8F9FB 0, #F8F9FB 34px, #E8ECF0 35px)",
};

const textareaStyle = {
  boxSizing: "border-box" as const,
  width: "100%",
  minHeight: 190,
  resize: "vertical" as const,
  padding: "13px 14px",
  border: "none",
  backgroundColor: "transparent",
  color: "#3D4859",
  fontFamily: "inherit",
  fontSize: 15,
  lineHeight: "35px",
  outline: "none",
};

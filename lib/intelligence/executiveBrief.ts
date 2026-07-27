export type ExecutiveBrief = {
  greeting: string;
  totalMeetingsToday: number;
  firstMeetingTime: string | null;
  investorMeetings: number;
  internalMeetings: number;
  hasConflicts: boolean;
  summary: string[];
};

type Meeting = {
  date: string;
  time: string;
  category: string;
  durationMinutes: number;
};

function sameDay(date: Date, isoDate: string) {
  return isoDate === date.toISOString().slice(0, 10);
}

export function buildExecutiveBrief(
  meetings: Meeting[],
  now: Date,
): ExecutiveBrief {
  const todaysMeetings = meetings
    .filter((meeting) => sameDay(now, meeting.date))
    .sort((a, b) => a.time.localeCompare(b.time));

  const investorMeetings = todaysMeetings.filter(
    (meeting) => meeting.category === "investor",
  ).length;

  const internalMeetings = todaysMeetings.filter(
    (meeting) => meeting.category === "internal",
  ).length;

  let hasConflicts = false;

  for (let i = 0; i < todaysMeetings.length - 1; i++) {
    const current = todaysMeetings[i];
    const next = todaysMeetings[i + 1];

    const currentStart = new Date(`${current.date}T${current.time}`);
    const currentEnd = new Date(currentStart);
    currentEnd.setMinutes(
      currentEnd.getMinutes() + current.durationMinutes,
    );

    const nextStart = new Date(`${next.date}T${next.time}`);

    if (nextStart < currentEnd) {
      hasConflicts = true;
      break;
    }
  }

  const summary: string[] = [];

  summary.push(
    `${todaysMeetings.length} meeting${
      todaysMeetings.length === 1 ? "" : "s"
    } scheduled today.`,
  );

  if (todaysMeetings.length > 0) {
    summary.push(
      `First meeting begins at ${todaysMeetings[0].time}.`,
    );
  }

  if (investorMeetings > 0) {
    summary.push(
      `${investorMeetings} investor meeting${
        investorMeetings === 1 ? "" : "s"
      }.`,
    );
  }

  if (internalMeetings > 0) {
    summary.push(
      `${internalMeetings} internal meeting${
        internalMeetings === 1 ? "" : "s"
      }.`,
    );
  }

  summary.push(
    hasConflicts
      ? "Scheduling conflict detected."
      : "No scheduling conflicts detected.",
  );

  return {
    greeting: "Good morning, Founders.",
    totalMeetingsToday: todaysMeetings.length,
    firstMeetingTime: todaysMeetings[0]?.time ?? null,
    investorMeetings,
    internalMeetings,
    hasConflicts,
    summary,
  };
}
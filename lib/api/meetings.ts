export type DatabaseMeeting = {
  id: string;
  organization_id: string;
  title: string;
  subtitle: string | null;
  purpose: string | null;
  objective: string | null;
  meeting_date: string;
  start_time: string;
  timezone: string | null;
  duration_minutes: number | null;
  meeting_type: string | null;
  meeting_category: string | null;
  destination: string | null;
  lifecycle_status: string | null;
  source: string | null;
  external_event_id: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type CreateDatabaseMeetingInput = {
  title: string;
  subtitle?: string;
  purpose?: string;
  objective?: string;
  meeting_date: string;
  start_time: string;
};

async function readErrorMessage(response: Response) {
  try {
    const result = (await response.json()) as {
      message?: string;
    };

    return result.message || "The request could not be completed.";
  } catch {
    return "The request could not be completed.";
  }
}

export async function fetchMeetings(): Promise<DatabaseMeeting[]> {
  const response = await fetch("/api/meetings", {
    method: "GET",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  return response.json() as Promise<DatabaseMeeting[]>;
}

export async function saveMeeting(
  meeting: CreateDatabaseMeetingInput,
): Promise<DatabaseMeeting> {
  const response = await fetch("/api/meetings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(meeting),
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  return response.json() as Promise<DatabaseMeeting>;
}

export async function deleteMeeting(id: string): Promise<void> {
  const response = await fetch(`/api/meetings/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }
}
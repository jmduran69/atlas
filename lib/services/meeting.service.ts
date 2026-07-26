import { createAdminClient } from "@/lib/supabase/admin";

type CreateMeetingInput = {
  title: string;
  subtitle?: string;
  purpose?: string;
  objective?: string;
  meeting_date: string;
  start_time: string;
};

function getOrganizationId() {
  const organizationId = process.env.ATLAS_ORGANIZATION_ID;

  if (!organizationId) {
    throw new Error("Missing ATLAS_ORGANIZATION_ID");
  }

  return organizationId;
}

export async function getMeetings() {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("meetings")
    .select("*")
    .eq("organization_id", getOrganizationId())
    .order("meeting_date", { ascending: true })
    .order("start_time", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function createMeeting(meeting: CreateMeetingInput) {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("meetings")
    .insert({
      organization_id: getOrganizationId(),
      title: meeting.title,
      subtitle: meeting.subtitle ?? null,
      purpose: meeting.purpose ?? null,
      objective: meeting.objective ?? null,
      meeting_date: meeting.meeting_date,
      start_time: meeting.start_time,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function deleteMeeting(id: string) {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("meetings")
    .delete()
    .eq("id", id)
    .eq("organization_id", getOrganizationId());

  if (error) {
    throw new Error(error.message);
  }
}
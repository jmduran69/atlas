import { createAdminClient } from "@/lib/supabase/admin";

type CreateMeetingInput = {
  title: string;
  subtitle?: string;
  purpose?: string;
  objective?: string;
  meeting_date: string;
  start_time: string;
  duration_minutes?: number | null;
  meeting_type?: string | null;
  meeting_category?: string | null;
  destination?: string | null;
  lifecycle_status?: string;
};

type UpdateMeetingInput = {
  title?: string;
  subtitle?: string;
  purpose?: string;
  objective?: string;
  meeting_date?: string;
  start_time?: string;
  duration_minutes?: number | null;
  meeting_type?: string | null;
  meeting_category?: string | null;
  destination?: string | null;
  lifecycle_status?: string;
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

export async function getMeeting(id: string) {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("meetings")
    .select("*")
    .eq("id", id)
    .eq("organization_id", getOrganizationId())
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
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
      duration_minutes: meeting.duration_minutes ?? 60,
      meeting_type: meeting.meeting_type ?? null,
      meeting_category: meeting.meeting_category ?? null,
      destination: meeting.destination ?? null,
      lifecycle_status: meeting.lifecycle_status ?? "scheduled",
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function updateMeeting(
  id: string,
  meeting: UpdateMeetingInput,
) {
  const supabase = createAdminClient();

  const updates: Record<string, string | number | null> = {};

  if (meeting.title !== undefined) {
    updates.title = meeting.title;
  }

  if (meeting.subtitle !== undefined) {
    updates.subtitle = meeting.subtitle || null;
  }

  if (meeting.purpose !== undefined) {
    updates.purpose = meeting.purpose || null;
  }

  if (meeting.objective !== undefined) {
    updates.objective = meeting.objective || null;
  }

  if (meeting.meeting_date !== undefined) {
    updates.meeting_date = meeting.meeting_date;
  }

  if (meeting.start_time !== undefined) {
    updates.start_time = meeting.start_time;
  }

  if (meeting.duration_minutes !== undefined) {
    updates.duration_minutes = meeting.duration_minutes;
  }

  if (meeting.meeting_type !== undefined) {
    updates.meeting_type = meeting.meeting_type || null;
  }

  if (meeting.meeting_category !== undefined) {
    updates.meeting_category =
      meeting.meeting_category || null;
  }

  if (meeting.destination !== undefined) {
    updates.destination = meeting.destination || null;
  }

  if (meeting.lifecycle_status !== undefined) {
    updates.lifecycle_status = meeting.lifecycle_status;
  }

  const { data, error } = await supabase
    .from("meetings")
    .update(updates)
    .eq("id", id)
    .eq("organization_id", getOrganizationId())
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
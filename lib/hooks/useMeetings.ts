"use client";

import { useEffect, useState } from "react";

import {
  fetchMeetings,
  saveMeeting,
  type CreateDatabaseMeetingInput,
} from "@/lib/api/meetings";

import {
  mapDatabaseMeetingToAtlas,
  type AtlasMeeting,
} from "@/lib/mappers/meeting.mapper";

export function useMeetings() {
  const [meetings, setMeetings] = useState<AtlasMeeting[]>([]);
  const [isLoadingMeetings, setIsLoadingMeetings] = useState(true);
  const [meetingsError, setMeetingsError] = useState<string | null>(null);

  async function reloadMeetings() {
    try {
      setIsLoadingMeetings(true);
      setMeetingsError(null);

      const databaseMeetings = await fetchMeetings();

      const loadedMeetings = databaseMeetings.map(
        mapDatabaseMeetingToAtlas,
      );

      setMeetings(loadedMeetings);
    } catch (error) {
      console.error("Atlas could not load meetings:", error);

      setMeetingsError(
        error instanceof Error
          ? error.message
          : "Atlas could not load meetings.",
      );
    } finally {
      setIsLoadingMeetings(false);
    }
  }

  async function addMeeting(input: CreateDatabaseMeetingInput) {
  const savedMeeting = await saveMeeting(input);
  await reloadMeetings();
  return savedMeeting;
}

  useEffect(() => {
    void reloadMeetings();
  }, []);

  return {
    meetings,
    setMeetings,
    addMeeting,
    reloadMeetings,
    isLoadingMeetings,
    meetingsError,
  };
}
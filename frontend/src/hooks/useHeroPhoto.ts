import { useQuery } from "@tanstack/react-query";
import { eventService } from "../services/eventService";
import { Photo } from "../types/photo";

export function useHeroPhoto(eventId: number | undefined) {
  return useQuery<Photo | null>({
    queryKey: ["heroPhoto", eventId],
    queryFn: async () => {
      if (!eventId) return null;
      return eventService.getHeroPhoto(eventId);
    },
    enabled: !!eventId,
    staleTime: 0, // Always refetch to ensure we have the latest
    retry: 1, // Only retry once since 404 is an expected response
  });
}

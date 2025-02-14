import { useQuery } from "@tanstack/react-query";
import { eventService } from "../services/eventService";

export const EVENT_QUERY_KEY = {
  event: (eventId: number) => ["event", eventId] as const,
};

export function useEvent(eventId: number) {
  return useQuery({
    queryKey: EVENT_QUERY_KEY.event(eventId),
    queryFn: () => eventService.getEvent(eventId),
  });
}

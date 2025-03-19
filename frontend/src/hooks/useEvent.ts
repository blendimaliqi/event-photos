import { useQuery } from "@tanstack/react-query";
import { eventService } from "../services/eventService";

export const EVENT_QUERY_KEY = {
  event: (eventId: number) => ["event", eventId] as const,
};

export function useEvent(eventId: number | undefined) {
  return useQuery({
    queryKey: EVENT_QUERY_KEY.event(eventId || 0),
    queryFn: eventId
      ? () => eventService.getEvent(eventId)
      : () => Promise.resolve(null),
    enabled: !!eventId,
  });
}

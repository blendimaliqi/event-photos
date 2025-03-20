import { queryClient } from "../providers/QueryProvider";
import { QUERY_KEYS } from "../hooks/useMedia";

/**
 * Invalidates all media-related caches for a specific event
 * Call this function after any media upload, deletion, or update
 */
export const invalidateMediaCaches = (eventId: number) => {
  // First cancel any ongoing queries to make sure they don't interfere
  queryClient.cancelQueries();

  // Force refetch all media queries with exact=false to catch all related queries
  queryClient.invalidateQueries({
    queryKey: QUERY_KEYS.allMedia(eventId),
    exact: false,
    refetchType: "all",
  });

  // Force refetch all photo queries
  queryClient.invalidateQueries({
    queryKey: QUERY_KEYS.allPhotos(eventId),
    exact: false,
    refetchType: "all",
  });

  // Force refetch all video queries
  queryClient.invalidateQueries({
    queryKey: QUERY_KEYS.allVideos(eventId),
    exact: false,
    refetchType: "all",
  });

  // Force refetch hero image queries
  queryClient.invalidateQueries({
    queryKey: ["heroImage"],
    exact: false,
    refetchType: "all",
  });

  // Force refetch event data which might contain heroPhotoId
  queryClient.invalidateQueries({
    queryKey: ["event", eventId],
    exact: false,
    refetchType: "all",
  });

  // Force refetch hero photo specifically
  queryClient.invalidateQueries({
    queryKey: ["heroPhoto", eventId],
    exact: false,
    refetchType: "all",
  });

  // After a short delay, refetch all queries again to ensure data consistency
  setTimeout(() => {
    queryClient.invalidateQueries({ refetchType: "all" });
  }, 300);
};

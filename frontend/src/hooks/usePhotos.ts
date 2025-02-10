import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { photoService } from "../services/photoService";

export const QUERY_KEYS = {
  photos: (eventId: number) => ["photos", eventId] as const,
};

export function usePhotos(eventId: number) {
  return useQuery({
    queryKey: QUERY_KEYS.photos(eventId),
    queryFn: () => photoService.getPhotos(eventId),
  });
}

export function usePhotoUpload() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (file: File) => photoService.uploadPhoto(file, "1"),
    onSuccess: () => {
      // Invalidate the photos query to trigger a refetch
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.photos(1) });
    },
  });

  return {
    uploadPhoto: mutation.mutate,
    isUploading: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
    reset: mutation.reset,
  };
}

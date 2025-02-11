import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { photoService } from "../services/photoService";
import { Photo } from "../types/photo";

export type SortOption = "newest" | "oldest" | "withDescription";

export const QUERY_KEYS = {
  photos: (eventId: number, sortBy?: SortOption) =>
    ["photos", eventId, sortBy] as const,
  allPhotos: (eventId: number) => ["photos", eventId] as const,
};

export function usePhotos(eventId: number, sortBy: SortOption = "newest") {
  return useQuery({
    queryKey: QUERY_KEYS.photos(eventId, sortBy),
    queryFn: () => photoService.getPhotos(eventId),
    select: (data: Photo[]) => {
      const photos = [...data];

      switch (sortBy) {
        case "newest":
          return photos.sort(
            (a, b) =>
              new Date(b.uploadDate).getTime() -
              new Date(a.uploadDate).getTime()
          );
        case "oldest":
          return photos.sort(
            (a, b) =>
              new Date(a.uploadDate).getTime() -
              new Date(b.uploadDate).getTime()
          );
        case "withDescription":
          return photos.sort((a, b) => {
            // Sort photos with descriptions first
            if (a.description && !b.description) return -1;
            if (!a.description && b.description) return 1;
            // If both have or don't have descriptions, sort by date
            return (
              new Date(b.uploadDate).getTime() -
              new Date(a.uploadDate).getTime()
            );
          });
        default:
          return photos;
      }
    },
  });
}

interface UploadPhotoParams {
  file: File;
  eventId: string;
  description: string;
}

export function usePhotoUpload(eventId: number) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({
      file,
      eventId: eventIdString,
      description,
    }: UploadPhotoParams) =>
      photoService.uploadPhoto(file, eventIdString, description),
    onSuccess: () => {
      // Invalidate all photo queries for this event, regardless of sort option
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.allPhotos(eventId),
      });
    },
  });

  const uploadPhoto = async (
    file: File,
    eventIdString: string,
    description: string
  ) => {
    if (!file.type.startsWith("image/")) {
      throw new Error("Only image files are allowed");
    }

    return mutation.mutateAsync({ file, eventId: eventIdString, description });
  };

  return {
    uploadPhoto,
    isUploading: mutation.isPending,
    error: mutation.error,
  };
}

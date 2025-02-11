import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { photoService } from "../services/photoService";
import { Photo } from "../types/photo";

export type SortOption = "newest" | "oldest" | "withDescription";

export const QUERY_KEYS = {
  photos: (eventId: number, sortBy?: SortOption) =>
    ["photos", eventId, sortBy] as const,
  allPhotos: (eventId: number) => ["photos", eventId] as const,
};

const sortPhotos = (photos: Photo[], sortBy: SortOption = "newest") => {
  const sortedPhotos = [...photos];

  switch (sortBy) {
    case "newest":
      return sortedPhotos.sort(
        (a, b) =>
          new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()
      );
    case "oldest":
      return sortedPhotos.sort(
        (a, b) =>
          new Date(a.uploadDate).getTime() - new Date(b.uploadDate).getTime()
      );
    case "withDescription":
      return sortedPhotos.sort((a, b) => {
        if (a.description && !b.description) return -1;
        if (!a.description && b.description) return 1;
        return (
          new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()
        );
      });
    default:
      return sortedPhotos;
  }
};

export function usePhotos(eventId: number, sortBy: SortOption = "newest") {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: QUERY_KEYS.photos(eventId, sortBy),
    queryFn: () => photoService.getPhotos(eventId),
    select: (data: Photo[]) => sortPhotos(data, sortBy),
    staleTime: 1000 * 60 * 3, // 3 minutes
    placeholderData: () => {
      // Use data from other sort queries as placeholder
      const otherSortQueries = queryClient
        .getQueriesData<Photo[]>({ queryKey: ["photos", eventId] })
        .map(([, data]) => data)
        .filter(Boolean)[0];

      if (otherSortQueries) {
        return sortPhotos(otherSortQueries, sortBy);
      }
      return undefined;
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
    onMutate: async ({ file, description }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: QUERY_KEYS.allPhotos(eventId),
      });

      // Create optimistic update
      const optimisticPhoto: Photo = {
        id: Math.random(), // temporary ID
        url: URL.createObjectURL(file),
        description,
        uploadDate: new Date().toISOString(),
        eventId,
      };

      // Add optimistic photo to all sort variations
      ["newest", "oldest", "withDescription"].forEach((sort) => {
        queryClient.setQueryData<Photo[]>(
          QUERY_KEYS.photos(eventId, sort as SortOption),
          (old = []) =>
            sortPhotos([...old, optimisticPhoto], sort as SortOption)
        );
      });

      return { optimisticPhoto };
    },
    onError: (_, __, context) => {
      // Remove optimistic update on error
      if (context?.optimisticPhoto) {
        ["newest", "oldest", "withDescription"].forEach((sort) => {
          queryClient.setQueryData<Photo[]>(
            QUERY_KEYS.photos(eventId, sort as SortOption),
            (old = []) =>
              old.filter((photo) => photo.id !== context.optimisticPhoto.id)
          );
        });
      }
    },
    onSettled: () => {
      // Refetch to ensure server state
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

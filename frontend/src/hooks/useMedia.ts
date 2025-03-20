import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { photoService } from "../services/photoService";
import { videoService } from "../services/videoService";
import { Media, photoToMedia, videoToMedia } from "../types/media";

export type SortOption = "newest" | "oldest" | "withDescription";

export const QUERY_KEYS = {
  photos: (eventId: number | undefined, sortBy?: SortOption) =>
    ["photos", eventId || 0, sortBy] as const,
  videos: (eventId: number | undefined, sortBy?: SortOption) =>
    ["videos", eventId || 0, sortBy] as const,
  media: (eventId: number | undefined, sortBy?: SortOption) =>
    ["media", eventId || 0, sortBy] as const,
  allPhotos: (eventId: number | undefined) => ["photos", eventId || 0] as const,
  allVideos: (eventId: number | undefined) => ["videos", eventId || 0] as const,
  allMedia: (eventId: number | undefined) => ["media", eventId || 0] as const,
};

const sortMedia = (media: Media[], sortBy: SortOption = "newest") => {
  const sortedMedia = [...media];

  switch (sortBy) {
    case "newest":
      return sortedMedia.sort(
        (a, b) =>
          new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()
      );
    case "oldest":
      return sortedMedia.sort(
        (a, b) =>
          new Date(a.uploadDate).getTime() - new Date(b.uploadDate).getTime()
      );
    case "withDescription":
      // First separate media with and without descriptions
      const withDesc = sortedMedia.filter((item) => item.description?.trim());
      const withoutDesc = sortedMedia.filter(
        (item) => !item.description?.trim()
      );

      // Sort each group by newest first
      withDesc.sort(
        (a, b) =>
          new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()
      );
      withoutDesc.sort(
        (a, b) =>
          new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()
      );

      // Return media with descriptions first, followed by those without
      return [...withDesc, ...withoutDesc];
    default:
      return sortedMedia;
  }
};

export function useMedia(
  eventId: number | undefined,
  sortBy: SortOption = "newest"
) {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: QUERY_KEYS.media(eventId || 0, sortBy),
    queryFn: async () => {
      if (!eventId) return [];

      // Add a small artificial delay to ensure loading state is visible
      // even for fast network connections
      const loadPromise = new Promise((resolve) => setTimeout(resolve, 300));

      const [photos, videos] = await Promise.all([
        photoService.getPhotos(eventId),
        videoService.getVideos(eventId),
        loadPromise, // Include the delay in the Promise.all
      ]);

      const photoMedia = photos.map(photoToMedia);
      const videoMedia = videos.map(videoToMedia);

      return [...photoMedia, ...videoMedia];
    },
    enabled: !!eventId,
    select: (data: Media[]) => {
      // No need to filter out hero photo anymore, backend handles it
      return sortMedia(data, sortBy);
    },
    staleTime: 0, // Changed from 3 minutes to 0 to always refetch
    networkMode: "always", // Always attempt network requests, even if offline
    refetchOnMount: true,
  });
}

interface UploadMediaParams {
  file: File;
  eventId: string;
  description: string;
}

export function useMediaUpload(eventId: number | undefined) {
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async ({ file, eventId, description }: UploadMediaParams) => {
      // Determine if the file is a video or photo based on its type
      const isVideo = file.type.startsWith("video/");

      if (isVideo) {
        return videoService.uploadVideo(file, eventId, description);
      } else {
        return photoService.uploadPhoto(file, eventId, description);
      }
    },
    onMutate: async ({ file, description }: UploadMediaParams) => {
      // Cancel any outgoing refetches to avoid overwriting our optimistic update
      await queryClient.cancelQueries({
        queryKey: QUERY_KEYS.allMedia(eventId || 0),
      });

      // Create optimistic media item
      const isVideo = file.type.startsWith("video/");
      const optimisticMedia: Media = {
        id: Math.random() * -1000, // Temporary negative ID to avoid conflicts
        type: isVideo ? "video" : "photo",
        url: URL.createObjectURL(file),
        thumbnailUrl: isVideo ? URL.createObjectURL(file) : undefined,
        description: description || "",
        uploadDate: new Date().toISOString(),
        eventId: eventId || 0,
      };

      // Add optimistic update to the media cache
      queryClient.setQueryData<Media[]>(
        QUERY_KEYS.media(eventId || 0, "newest"),
        (old = []) => [optimisticMedia, ...old]
      );

      return { optimisticMedia };
    },
    onError: (error, _, context) => {
      console.error("Error uploading media:", error);

      // Remove the optimistic update on error
      if (context?.optimisticMedia && eventId) {
        queryClient.setQueryData<Media[]>(
          QUERY_KEYS.media(eventId, "newest"),
          (old = []) =>
            old.filter((item) => item.id !== context.optimisticMedia.id)
        );
      }
    },
    onSettled: (_, error) => {
      if (eventId) {
        // Force immediate refetch of all related queries
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.allMedia(eventId),
          refetchType: "all",
        });

        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.allPhotos(eventId),
          refetchType: "all",
        });

        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.allVideos(eventId),
          refetchType: "all",
        });

        // Invalidate event data which might contain heroPhotoId
        queryClient.invalidateQueries({
          queryKey: ["event", eventId],
          refetchType: "all",
        });

        // If there was no error, add a delay and refetch again to ensure we have the latest data
        if (!error) {
          setTimeout(() => {
            queryClient.invalidateQueries({
              queryKey: QUERY_KEYS.allMedia(eventId),
              refetchType: "all",
            });
          }, 500);
        }
      }
    },
  });

  const uploadFiles = async (
    files: File[],
    descriptions: string[]
  ): Promise<void> => {
    if (!eventId) {
      throw new Error("Cannot upload files without a valid eventId");
    }

    const uploads = files.map((file, index) => {
      return uploadMutation.mutateAsync({
        file,
        eventId: eventId.toString(),
        description: descriptions[index] || "",
      });
    });

    await Promise.all(uploads);
  };

  return {
    uploadFiles,
    isUploading: uploadMutation.isPending,
    error: uploadMutation.error,
  };
}

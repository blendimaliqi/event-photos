import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { photoService } from "../services/photoService";
import { videoService } from "../services/videoService";
import { Media, photoToMedia, videoToMedia } from "../types/media";

export type SortOption = "newest" | "oldest" | "withDescription";

export const QUERY_KEYS = {
  photos: (eventId: number, sortBy?: SortOption) =>
    ["photos", eventId, sortBy] as const,
  videos: (eventId: number, sortBy?: SortOption) =>
    ["videos", eventId, sortBy] as const,
  media: (eventId: number, sortBy?: SortOption) =>
    ["media", eventId, sortBy] as const,
  allPhotos: (eventId: number) => ["photos", eventId] as const,
  allVideos: (eventId: number) => ["videos", eventId] as const,
  allMedia: (eventId: number) => ["media", eventId] as const,
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
  eventId: number,
  sortBy: SortOption = "newest",
  heroPhotoId?: number
) {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: QUERY_KEYS.media(eventId, sortBy),
    queryFn: async () => {
      const [photos, videos] = await Promise.all([
        photoService.getPhotos(eventId),
        videoService.getVideos(eventId),
      ]);

      const photoMedia = photos.map(photoToMedia);
      const videoMedia = videos.map(videoToMedia);

      return [...photoMedia, ...videoMedia];
    },
    select: (data: Media[]) => {
      // Get the current event data from the cache if heroPhotoId wasn't provided
      const event = !heroPhotoId
        ? queryClient.getQueryData<{ heroPhotoId?: number }>(["event", eventId])
        : { heroPhotoId };

      // Filter out hero photo (only for photos, not videos) and then sort
      const filteredMedia = data.filter(
        (media) => !(media.type === "photo" && media.id === event?.heroPhotoId)
      );
      return sortMedia(filteredMedia, sortBy);
    },
    staleTime: 1000 * 60 * 3, // 3 minutes
  });
}

interface UploadMediaParams {
  file: File;
  eventId: string;
  description: string;
}

export function useMediaUpload(eventId: number) {
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
    onSuccess: () => {
      // Invalidate and refetch media queries
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.allMedia(eventId) });
    },
  });

  const uploadFiles = async (
    files: File[],
    descriptions: string[]
  ): Promise<void> => {
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

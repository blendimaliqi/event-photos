import { Photo } from "./photo";
import { Video } from "./video";

export type MediaType = "photo" | "video";

export interface Media {
  id: number;
  url: string;
  description: string;
  eventId: number;
  uploadDate: string;
  type: MediaType;
  thumbnailUrl?: string;
}

export function photoToMedia(photo: Photo): Media {
  return {
    ...photo,
    type: "photo",
  };
}

export function videoToMedia(video: Video): Media {
  console.log(
    `Processing video to media conversion. ThumbnailUrl: ${
      video.thumbnailUrl || "none"
    }`
  );
  return {
    ...video,
    type: "video",
    thumbnailUrl: video.thumbnailUrl,
  };
}

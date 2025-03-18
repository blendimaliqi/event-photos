import { Media } from "../types/media";
import { config } from "../config/config";

// Format for react-image-gallery
export interface GalleryItem {
  original: string;
  thumbnail: string;
  description?: string;
  originalAlt?: string;
  thumbnailAlt?: string;
  originalHeight?: number;
  originalWidth?: number;
  thumbnailHeight?: number;
  thumbnailWidth?: number;
  loading?: "lazy" | "eager";
  bulletClass?: string;
  renderItem?: (item: GalleryItem) => React.ReactNode;
  renderThumbInner?: (item: GalleryItem) => React.ReactNode;
  isVideo?: boolean; // Custom property to identify videos
  videoUrl?: string; // URL for video files
  videoThumbnail?: string; // Thumbnail for video items
}

// Format for lightgallery
export interface LightGalleryItem {
  id: number;
  src: string;
  thumb: string;
  subHtml?: string;
  video?: {
    source: { src: string; type: string }[];
    attributes: { [key: string]: string };
  };
}

/**
 * Converts app media items to the format needed for react-image-gallery
 */
export function convertToGalleryItems(mediaItems: Media[]): GalleryItem[] {
  return mediaItems.map((media) => {
    const url = config.getImageUrl(media.url);
    const thumbnailUrl = media.thumbnailUrl
      ? config.getImageUrl(media.thumbnailUrl)
      : media.type === "video"
      ? `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 100 100"><rect width="100%" height="100%" fill="%23374151"/></svg>`
      : url;

    // Base properties for both types
    const item: GalleryItem = {
      original: url,
      thumbnail: thumbnailUrl,
      description: media.description,
      originalAlt: media.description || "Gallery image",
      thumbnailAlt: media.description || "Thumbnail",
      isVideo: media.type === "video",
    };

    // Add video specific properties
    if (media.type === "video") {
      item.videoUrl = url;
      item.videoThumbnail = thumbnailUrl;
    }

    return item;
  });
}

/**
 * Converts app media items to the format needed for lightgallery
 */
export function convertToLightGalleryItems(
  mediaItems: Media[]
): LightGalleryItem[] {
  return mediaItems.map((media) => {
    const url = config.getImageUrl(media.url);
    const thumbnailUrl = media.thumbnailUrl
      ? config.getImageUrl(media.thumbnailUrl)
      : media.type === "video"
      ? `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 100 100"><rect width="100%" height="100%" fill="%23374151"/></svg>`
      : url;

    // Base properties
    const item: LightGalleryItem = {
      id: media.id,
      src: url,
      thumb: thumbnailUrl,
      subHtml: media.description ? `<h4>${media.description}</h4>` : undefined,
    };

    // Add video specific properties
    if (media.type === "video") {
      item.video = {
        source: [
          {
            src: url,
            type: "video/mp4", // Assuming MP4 format, adjust if needed
          },
        ],
        attributes: {
          preload: "none",
          controls: "true",
        },
      };
    }

    return item;
  });
}

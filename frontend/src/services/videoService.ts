import { Video } from "../types/video";
import { config } from "../config/config";
import { FILE_SIZE_LIMITS } from "../config/constants";
import { generateVideoThumbnail } from "../utils/videoUtils";

const API_URL = config.API_ENDPOINT;

export const videoService = {
  async uploadVideo(
    file: File,
    eventId: string,
    description: string
  ): Promise<Video> {
    // Validate file size before attempting upload
    if (file.size > FILE_SIZE_LIMITS.MAX_VIDEO_SIZE_BYTES) {
      throw new Error(
        `Video exceeds maximum size of ${FILE_SIZE_LIMITS.MAX_VIDEO_SIZE_MB}MB. Please upload a smaller file.`
      );
    }

    console.log(`Starting video upload process for ${file.name}`);

    // Extract video thumbnail
    const thumbnailBlob = await extractVideoThumbnail(file);
    console.log(
      `Thumbnail extracted:`,
      thumbnailBlob ? `Success (${thumbnailBlob.size} bytes)` : "Failed"
    );

    const formData = new FormData();
    formData.append("file", file);
    formData.append("eventId", eventId);
    formData.append("description", description);

    // Add thumbnail if available
    if (thumbnailBlob) {
      // Convert blob to File object with appropriate name and type
      const thumbnailFile = new File(
        [thumbnailBlob],
        `thumbnail-${file.name.replace(/\.[^/.]+$/, "")}.jpg`,
        { type: "image/jpeg" }
      );
      console.log(
        `Thumbnail file created: ${thumbnailFile.name}, size: ${thumbnailFile.size}`
      );
      formData.append("thumbnail", thumbnailFile);
    }

    console.log(`Sending video upload request to ${API_URL}/videos`);
    const response = await fetch(`${API_URL}/videos`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      // Handle specific error messages from the API
      const responseText = await response.text();

      // Try to parse as JSON
      try {
        const errorData = JSON.parse(responseText);

        // Check if it's a file size error response
        if (
          responseText.toLowerCase().includes("size") &&
          responseText.toLowerCase().includes("exceed")
        ) {
          throw new Error(
            errorData ||
              `Video size exceeds the maximum allowed size of ${FILE_SIZE_LIMITS.MAX_VIDEO_SIZE_MB}MB.`
          );
        }
      } catch (parseError) {
        // If not JSON or doesn't have expected structure, check for size-related text
        if (
          responseText.toLowerCase().includes("size") &&
          responseText.toLowerCase().includes("exceed")
        ) {
          throw new Error(
            `Video exceeds maximum size limit of ${FILE_SIZE_LIMITS.MAX_VIDEO_SIZE_MB}MB`
          );
        }
      }

      // Default error message
      throw new Error("Failed to upload video. The file may be too large.");
    }

    return response.json();
  },

  async getVideos(eventId: number): Promise<Video[]> {
    const response = await fetch(`${API_URL}/videos/event/${eventId}`);

    if (!response.ok) {
      throw new Error("Failed to fetch videos");
    }

    const videos = await response.json();

    // Debug log to see what's coming from the backend
    console.log("Videos from backend:", videos);

    return videos;
  },

  async deleteVideo(videoId: number): Promise<void> {
    const response = await fetch(`${API_URL}/videos/${videoId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Failed to delete video");
    }
  },
};

/**
 * Extract a thumbnail from a video file
 * This leverages the browser's ability to generate thumbnails from videos
 */
async function extractVideoThumbnail(videoFile: File): Promise<Blob | null> {
  try {
    // Use the improved thumbnail generator from videoUtils
    return await generateVideoThumbnail(videoFile, 0.5);
  } catch (error) {
    console.error("Error extracting video thumbnail:", error);
    return null; // Return null if we can't extract the thumbnail
  }
}

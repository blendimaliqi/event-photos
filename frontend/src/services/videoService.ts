import { Video } from "../types/video";
import { config } from "../config/config";
import { FILE_SIZE_LIMITS } from "../config/constants";

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

    // Extract video thumbnail
    const thumbnailBlob = await extractVideoThumbnail(file);

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
      formData.append("thumbnail", thumbnailFile);
    }

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

    return response.json();
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
    // Create a video element to load the video
    const video = document.createElement("video");
    video.preload = "metadata";

    // Create a URL for the video file
    const videoUrl = URL.createObjectURL(videoFile);
    video.src = videoUrl;

    // Wait for the video metadata to load
    await new Promise<void>((resolve, reject) => {
      video.onloadedmetadata = () => resolve();
      video.onerror = () => reject(new Error("Failed to load video metadata"));
      // Set timeout in case video loading hangs
      setTimeout(
        () => reject(new Error("Timeout loading video metadata")),
        5000
      );
    });

    // Seek to the first frame or a specific time (e.g., 0.5 seconds in)
    video.currentTime = 0.5;

    // Wait for the seek to complete
    await new Promise<void>((resolve, reject) => {
      video.onseeked = () => resolve();
      video.onerror = () => reject(new Error("Failed to seek video"));
      // Set timeout in case seeking hangs
      setTimeout(() => reject(new Error("Timeout seeking video")), 5000);
    });

    // Create a canvas to draw the video frame
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw the video frame on the canvas
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Failed to get canvas context");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Clean up
    URL.revokeObjectURL(videoUrl);

    // Convert canvas to a blob (JPEG format)
    return new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error("Failed to create thumbnail blob"));
        },
        "image/jpeg",
        0.8 // Quality parameter
      );
    });
  } catch (error) {
    console.error("Error extracting video thumbnail:", error);
    return null; // Return null if we can't extract the thumbnail
  }
}

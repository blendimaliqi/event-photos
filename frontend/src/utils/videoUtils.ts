/**
 * Utility functions for handling videos
 */

/**
 * Generates a thumbnail image from a video file
 * @param videoFile The video file to generate a thumbnail from
 * @param seekTime Optional time in seconds to seek to for the thumbnail (default: 0.1)
 * @returns Promise that resolves to a Blob of the thumbnail image in JPEG format
 */
export const generateVideoThumbnail = async (
  videoFile: File,
  seekTime: number = 0.1
): Promise<Blob> => {
  console.log(
    `Generating thumbnail for video: ${videoFile.name}, type: ${videoFile.type}, size: ${videoFile.size}`
  );

  return new Promise((resolve, reject) => {
    // Create a video element
    const video = document.createElement("video");

    // Create an object URL for the video file
    const videoUrl = URL.createObjectURL(videoFile);

    // Set up video element
    video.src = videoUrl;
    video.muted = true;
    video.playsInline = true;
    video.preload = "metadata";

    // This triggers when video metadata is loaded
    video.onloadedmetadata = () => {
      console.log(
        `Video metadata loaded. Duration: ${video.duration}, dimensions: ${video.videoWidth}x${video.videoHeight}`
      );
      // Seek to the specified time
      video.currentTime = Math.min(seekTime, video.duration / 2);
    };

    // This triggers when seeking is complete and the frame is available
    video.onseeked = () => {
      // Create a canvas to draw the video frame
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw the current frame to the canvas
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        URL.revokeObjectURL(videoUrl);
        reject(new Error("Failed to get canvas context"));
        return;
      }

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Cleanup
      URL.revokeObjectURL(videoUrl);

      // Convert the canvas to a Blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("Failed to create thumbnail blob"));
          }
        },
        "image/jpeg",
        0.85 // JPEG quality (0-1)
      );
    };

    // Handle errors
    video.onerror = () => {
      URL.revokeObjectURL(videoUrl);
      reject(new Error("Error loading video for thumbnail generation"));
    };

    // Start playing to trigger the seek
    video.play().catch((error) => {
      URL.revokeObjectURL(videoUrl);
      reject(error);
    });
  });
};

/**
 * Creates a File object from a Blob
 * @param blob The blob to convert to a File
 * @param filename The name for the new file
 * @param mimeType The MIME type of the file
 * @returns A File object
 */
export const blobToFile = (
  blob: Blob,
  filename: string,
  mimeType: string
): File => {
  return new File([blob], filename, { type: mimeType });
};

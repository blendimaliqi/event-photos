import { useState, useRef } from "react";
import { generateVideoThumbnail } from "./videoUtils";
import { config } from "../config/config";

/**
 * A simple test component to verify video thumbnail generation
 * This can be used for testing purposes only and should be accessed via a route like /test-thumbnails
 */
export default function VideoThumbnailTest() {
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dbMessage, setDbMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const API_URL = config.API_ENDPOINT;

  const handleGenerateThumbnail = async () => {
    const fileInput = fileInputRef.current;
    if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
      setError("Please select a video file first");
      return;
    }

    const videoFile = fileInput.files[0];
    if (!videoFile.type.startsWith("video/")) {
      setError("Selected file is not a video");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      // Clean up previous thumbnail URL
      if (thumbnailUrl) {
        URL.revokeObjectURL(thumbnailUrl);
        setThumbnailUrl(null);
      }

      // Generate thumbnail from the video
      const thumbnailBlob = await generateVideoThumbnail(videoFile, 0.5);
      const url = URL.createObjectURL(thumbnailBlob);
      setThumbnailUrl(url);
    } catch (err) {
      console.error("Error generating thumbnail:", err);
      setError(
        `Failed to generate thumbnail: ${
          err instanceof Error ? err.message : String(err)
        }`
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const createThumbnailColumn = async () => {
    setDbMessage("Attempting to create ThumbnailUrl column...");
    try {
      // This is just a dummy request that will trigger the column creation code
      // in our VideoRepository when it receives a request with a thumbnail
      const formData = new FormData();
      const dummyFile = new File(["dummy content"], "dummy.mp4", {
        type: "video/mp4",
      });
      const dummyThumbnail = new File(["dummy thumbnail"], "thumbnail.jpg", {
        type: "image/jpeg",
      });

      formData.append("file", dummyFile);
      formData.append("eventId", "1"); // Assuming event 1 exists
      formData.append("description", "Test thumbnail column creation");
      formData.append("thumbnail", dummyThumbnail);

      // Send a minimal request - this will likely fail but should trigger column creation
      await fetch(`${API_URL}/videos`, {
        method: "POST",
        body: formData,
      });

      setDbMessage(
        "Request sent. ThumbnailUrl column should be created if it didn't exist."
      );
    } catch (err) {
      console.error("Error sending request:", err);
      setDbMessage(
        `Error: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">Video Thumbnail Test</h1>

      <div className="mb-4">
        <input
          type="file"
          ref={fileInputRef}
          accept="video/*"
          className="block w-full mb-2"
        />
        <button
          onClick={handleGenerateThumbnail}
          disabled={isGenerating}
          className="px-4 py-2 bg-rose-500 text-white rounded-md hover:bg-rose-600 transition-colors disabled:opacity-50 mr-2"
        >
          {isGenerating ? "Generating..." : "Generate Thumbnail"}
        </button>

        <button
          onClick={createThumbnailColumn}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          Ensure DB Column Exists
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 border border-red-200 rounded-md">
          {error}
        </div>
      )}

      {dbMessage && (
        <div className="mb-4 p-3 bg-blue-50 text-blue-600 border border-blue-200 rounded-md">
          {dbMessage}
        </div>
      )}

      {thumbnailUrl && (
        <div className="mt-6 space-y-4">
          <h2 className="text-xl font-semibold">Generated Thumbnail:</h2>
          <div className="border border-gray-200 rounded-md overflow-hidden">
            <img
              src={thumbnailUrl}
              alt="Generated video thumbnail"
              className="w-full object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}

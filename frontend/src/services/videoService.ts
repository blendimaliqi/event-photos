import { Video } from "../types/video";
import { config } from "../config/config";

const API_URL = config.API_ENDPOINT;

export const videoService = {
  async uploadVideo(
    file: File,
    eventId: string,
    description: string
  ): Promise<Video> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("eventId", eventId);
    formData.append("description", description);

    const response = await fetch(`${API_URL}/videos`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Failed to upload video");
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
  }
};

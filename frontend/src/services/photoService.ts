import { Photo } from "../types/photo";
import { config } from "../config/config";
import { Event } from "../types/event";

interface PhotoUploadResponse {
  id: string;
  url: string;
}

const API_URL = config.API_ENDPOINT;

export const photoService = {
  async uploadPhoto(
    file: File,
    eventId: string,
    description: string
  ): Promise<PhotoUploadResponse> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("eventId", eventId);
    formData.append("description", description);

    const response = await fetch(`${API_URL}/photos`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Failed to upload photo");
    }

    return response.json();
  },

  async getPhotos(eventId: number): Promise<Photo[]> {
    // Get photos directly from the backend which now handles filtering out the hero photo
    const photosResponse = await fetch(`${API_URL}/photos/event/${eventId}`);
    if (!photosResponse.ok) {
      throw new Error("Failed to fetch photos");
    }
    return photosResponse.json();
  },

  async deletePhoto(photoId: number): Promise<void> {
    const response = await fetch(`${API_URL}/photos/${photoId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Failed to delete photo");
    }
  },

  async setHeroPhoto(
    eventId: number,
    file: File,
    description?: string
  ): Promise<Event> {
    const formData = new FormData();
    formData.append("file", file);
    if (description) {
      formData.append("description", description);
    }

    const response = await fetch(`${API_URL}/events/${eventId}/hero-photo`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Failed to set hero photo");
    }

    return response.json();
  },
};

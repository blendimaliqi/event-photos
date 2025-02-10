import { Photo } from "../types/photo";

interface PhotoUploadResponse {
  id: string;
  url: string;
}

const API_URL = "http://localhost:5035/api";

export const photoService = {
  async uploadPhoto(file: File, eventId: string): Promise<PhotoUploadResponse> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("eventId", eventId);

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
    const response = await fetch(`${API_URL}/photos/event/${eventId}`);

    if (!response.ok) {
      throw new Error("Failed to fetch photos");
    }

    return response.json();
  },
};

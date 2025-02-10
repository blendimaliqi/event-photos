import { PhotoUploadResponse } from "../types/photo";

const API_URL = "http://localhost:5035/api";

export const photoService = {
  uploadPhoto: async (
    file: File,
    eventId: string
  ): Promise<PhotoUploadResponse> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("eventId", eventId);

    const response = await fetch(`${API_URL}/photos`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Upload failed");
    }

    return response.json();
  },
};

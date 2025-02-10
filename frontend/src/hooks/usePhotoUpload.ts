import { useState } from "react";
import { photoService } from "../services/photoService";

export function usePhotoUpload() {
  const [isUploading, setIsUploading] = useState(false);

  const uploadPhoto = async (file: File, eventId: string) => {
    if (!file.type.startsWith("image/")) {
      throw new Error("Only image files are allowed");
    }

    try {
      setIsUploading(true);
      await photoService.uploadPhoto(file, eventId);
    } catch (error) {
      console.error("Upload error:", error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    uploadPhoto,
    isUploading,
  };
}

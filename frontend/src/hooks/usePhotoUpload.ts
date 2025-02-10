import { useState, useCallback } from "react";
import { UploadStatus } from "../types/photo";
import { photoService } from "../services/photoService";

export const usePhotoUpload = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>("idle");

  const handleFileSelect = useCallback((file: File | null) => {
    if (file && file.type.startsWith("image/")) {
      setSelectedFile(file);
    }
  }, []);

  const uploadPhoto = async () => {
    if (!selectedFile) return;

    try {
      setUploadStatus("uploading");
      await photoService.uploadPhoto(selectedFile, "1"); // Default eventId for now
      setUploadStatus("success");
      setSelectedFile(null);
    } catch (error) {
      console.error("Upload error:", error);
      setUploadStatus("error");
    }
  };

  return {
    selectedFile,
    uploadStatus,
    handleFileSelect,
    uploadPhoto,
  };
};

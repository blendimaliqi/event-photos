import React from "react";
import { DragAndDrop } from "./DragAndDrop";
import { usePhotoUpload } from "../hooks/usePhotoUpload";

interface PhotoUploadProps {
  eventId: number;
}

export function PhotoUpload({ eventId }: PhotoUploadProps) {
  const { uploadPhoto, isUploading } = usePhotoUpload();

  const handleFileUpload = async (files: FileList) => {
    for (let i = 0; i < files.length; i++) {
      try {
        await uploadPhoto(files[i], eventId.toString());
      } catch (error) {
        console.error("Failed to upload photo:", error);
      }
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto mb-8">
      <DragAndDrop onFilesDrop={handleFileUpload} isUploading={isUploading} />
    </div>
  );
}

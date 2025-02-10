import { DragAndDrop } from "./DragAndDrop";
import { usePhotoUpload } from "../hooks/usePhotoUpload";
import { useState } from "react";
import { PhotoUploadModal } from "./PhotoUploadModal";

interface PhotoUploadProps {
  eventId: number;
}

export function PhotoUpload({ eventId }: PhotoUploadProps) {
  const { uploadPhoto, isUploading, error } = usePhotoUpload(eventId);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const handleFileUpload = async (files: FileList) => {
    setSelectedFiles(Array.from(files));
  };

  const handleConfirm = async (descriptions: string[]) => {
    try {
      // Upload all photos with their descriptions
      await Promise.all(
        selectedFiles.map((file, index) =>
          uploadPhoto(file, eventId.toString(), descriptions[index] || "")
        )
      );
      setSelectedFiles([]);
    } catch (error) {
      console.error("Failed to upload photos:", error);
    }
  };

  const handleCancel = () => {
    setSelectedFiles([]);
  };

  return (
    <div className="w-full max-w-lg mx-auto mb-8">
      {error && (
        <div className="text-red-500 text-center mb-4">
          {error instanceof Error ? error.message : "Upload failed"}
        </div>
      )}
      <DragAndDrop onFilesDrop={handleFileUpload} isUploading={isUploading} />
      {selectedFiles.length > 0 && (
        <PhotoUploadModal
          files={selectedFiles}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
          isUploading={isUploading}
        />
      )}
    </div>
  );
}

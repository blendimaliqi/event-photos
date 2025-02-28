import { DragAndDrop } from "./DragAndDrop";
import { useMediaUpload } from "../hooks/useMedia";
import { useState } from "react";
import { PhotoUploadModal } from "./PhotoUploadModal";

interface PhotoUploadProps {
  eventId: number;
}

export function PhotoUpload({ eventId }: PhotoUploadProps) {
  const { uploadFiles, isUploading, error } = useMediaUpload(eventId);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const handleFileUpload = async (files: FileList) => {
    setSelectedFiles(Array.from(files));
  };

  const handleConfirm = async (descriptions: string[]) => {
    try {
      // Upload all media with their descriptions
      await uploadFiles(selectedFiles, descriptions);
      setSelectedFiles([]);
    } catch (error) {
      console.error("Failed to upload media:", error);
    }
  };

  const handleCancel = () => {
    setSelectedFiles([]);
  };

  return (
    <div className="w-full max-w-lg mx-auto mb-8">
      {error && (
        <div className="text-red-500 text-center mb-4">
          {error instanceof Error ? error.message : "Ngarkimi dështoi"}
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

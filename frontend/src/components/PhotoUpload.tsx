import { DragAndDrop } from "./DragAndDrop";
import { usePhotoUpload } from "../hooks/usePhotoUpload";
import { useState } from "react";
import { PhotoUploadModal } from "./PhotoUploadModal";

interface PhotoUploadProps {
  eventId: number;
}

export function PhotoUpload({ eventId }: PhotoUploadProps) {
  const { uploadPhoto, isUploading, error } = usePhotoUpload(eventId);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileUpload = async (files: FileList) => {
    if (files.length > 0) {
      setSelectedFile(files[0]);
    }
  };

  const handleConfirm = async (description: string) => {
    if (selectedFile) {
      try {
        await uploadPhoto(selectedFile, eventId.toString(), description);
        setSelectedFile(null);
      } catch (error) {
        console.error("Failed to upload photo:", error);
      }
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
  };

  return (
    <div className="w-full max-w-lg mx-auto mb-8">
      {error && (
        <div className="text-red-500 text-center mb-4">
          {error instanceof Error ? error.message : "Upload failed"}
        </div>
      )}
      <DragAndDrop onFilesDrop={handleFileUpload} isUploading={isUploading} />
      {selectedFile && (
        <PhotoUploadModal
          file={selectedFile}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
          isUploading={isUploading}
        />
      )}
    </div>
  );
}

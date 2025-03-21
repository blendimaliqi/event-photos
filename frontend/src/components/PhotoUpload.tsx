import { DragAndDrop } from "./DragAndDrop";
import { useMediaUpload } from "../hooks/useMedia";
import { useState, useEffect } from "react";
import { PhotoUploadModal } from "./PhotoUploadModal";
import { invalidateMediaCaches } from "../utils/cacheUtils";
import { queryClient } from "../providers/QueryProvider";

interface PhotoUploadProps {
  eventId: number;
}

export function PhotoUpload({ eventId }: PhotoUploadProps) {
  const { uploadFiles, isUploading, error } = useMediaUpload(eventId);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isSuccess, setIsSuccess] = useState(false);

  // Clear success message after 3 seconds
  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        setIsSuccess(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess]);

  const handleFileUpload = async (files: FileList) => {
    setSelectedFiles(Array.from(files));
  };

  const handleConfirm = async (descriptions: string[]) => {
    try {
      // Upload all media with their descriptions
      await uploadFiles(selectedFiles, descriptions);

      // First cancel any in-flight queries to make sure they don't interfere
      await queryClient.cancelQueries();

      // Manually invalidate all media-related caches to ensure fresh data
      invalidateMediaCaches(eventId);

      // Force a refetch of all media after a short delay
      setTimeout(() => {
        invalidateMediaCaches(eventId);
      }, 500);

      // Show success message and clear selected files
      setIsSuccess(true);
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

      {isSuccess && (
        <div className="bg-green-50 text-green-700 p-3 rounded-lg mb-4 text-center border border-green-200 animate-fadeIn">
          Media u ngarkua me sukses! Po përditësohet galeria...
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

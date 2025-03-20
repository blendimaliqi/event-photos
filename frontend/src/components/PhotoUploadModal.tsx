import { useState, useEffect } from "react";
import { FILE_SIZE_LIMITS, formatFileSize } from "../config/constants";

interface MediaUploadModalProps {
  files: File[];
  onConfirm: (descriptions: string[]) => void;
  onCancel: () => void;
  isUploading: boolean;
}

interface PreviewItem {
  url: string;
  error: boolean;
  isVideo: boolean;
  fileSize?: number;
}

export function PhotoUploadModal({
  files,
  onConfirm,
  onCancel,
  isUploading,
}: MediaUploadModalProps) {
  const maxChars = 1500;
  const [descriptions, setDescriptions] = useState<string[]>(
    files.map(() => "")
  );
  const [previews, setPreviews] = useState<PreviewItem[]>([]);

  // Create preview URLs when files change
  useEffect(() => {
    const newPreviews = files.map((file) => ({
      url: URL.createObjectURL(file),
      error: false,
      isVideo: file.type.startsWith("video/"),
      fileSize: file.size,
    }));
    setPreviews(newPreviews);

    // Cleanup function to revoke object URLs
    return () => {
      newPreviews.forEach((preview) => {
        URL.revokeObjectURL(preview.url);
      });
    };
  }, [files]);

  const handleConfirm = () => {
    onConfirm(descriptions);
  };

  const handlePreviewError = (index: number) => {
    setPreviews((prev) =>
      prev.map((p, i) => (i === index ? { ...p, error: true } : p))
    );
  };

  const handleDescriptionChange = (index: number, value: string) => {
    if (value.length <= maxChars) {
      setDescriptions((prev) =>
        prev.map((desc, i) => (i === index ? value : desc))
      );
    }
  };

  const renderPreview = (preview: PreviewItem, index: number) => {
    if (preview.error) {
      return (
        <div className="flex items-center justify-center h-full text-gray-500">
          Nuk mund të shfaqet media
        </div>
      );
    }

    if (preview.isVideo) {
      const isVideoTooLarge =
        preview.fileSize &&
        preview.fileSize > FILE_SIZE_LIMITS.MAX_VIDEO_SIZE_BYTES;

      return (
        <div className="relative w-full h-full">
          <video
            src={preview.url}
            className="w-full h-full object-contain"
            controls
            preload="metadata"
          />
          <div className="absolute top-2 right-2 bg-black/60 text-white px-2 py-1 rounded-md text-xs">
            Video
          </div>
          {preview.fileSize && (
            <div
              className={`absolute bottom-2 right-2 ${
                isVideoTooLarge ? "bg-red-500" : "bg-black/60"
              } text-white px-2 py-1 rounded-md text-xs`}
            >
              {formatFileSize(preview.fileSize)}
              {isVideoTooLarge &&
                ` - Shumë e madhe! (Max: ${FILE_SIZE_LIMITS.MAX_VIDEO_SIZE_MB}MB)`}
            </div>
          )}
        </div>
      );
    }

    return (
      <img
        src={preview.url}
        alt={`Preview ${index + 1}`}
        className="w-full h-full object-contain"
        onError={() => handlePreviewError(index)}
      />
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full p-6 space-y-6 max-h-[90vh] overflow-y-auto shadow-xl">
        <h3 className="text-2xl font-serif text-gray-800 border-b pb-4">
          Konfirmo Ngarkimin
        </h3>

        <div className="grid grid-cols-1 gap-8">
          {files.map((file, index) => {
            const isVideoTooLarge =
              file.type.startsWith("video/") &&
              file.size > FILE_SIZE_LIMITS.MAX_VIDEO_SIZE_BYTES;

            return (
              <div key={index} className="space-y-4">
                <div className="relative rounded-lg overflow-hidden bg-gray-50 h-64 shadow-sm border">
                  {previews[index] && renderPreview(previews[index], index)}
                </div>

                {isVideoTooLarge && (
                  <div className="rounded-md bg-red-50 p-2 text-red-600 text-sm">
                    Kujdes: Ky video është {formatFileSize(file.size)} dhe
                    tejkalon kufirin e madhësisë prej{" "}
                    {FILE_SIZE_LIMITS.MAX_VIDEO_SIZE_MB}MB. Ngarkimi mund të
                    dështojë.
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label
                      htmlFor={`description-${index}`}
                      className="block text-sm font-medium text-gray-700"
                    >
                      Përshkrimi për{" "}
                      {previews[index]?.isVideo ? "videon" : "foton"}{" "}
                      {index + 1}
                    </label>
                    <span
                      className={`text-xs ${
                        maxChars - descriptions[index].length < 150
                          ? "text-rose-500"
                          : "text-gray-400"
                      }`}
                    >
                      {maxChars - descriptions[index].length} karaktere të
                      mbetura
                    </span>
                  </div>

                  <textarea
                    id={`description-${index}`}
                    rows={3}
                    className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-rose-500 focus:border-rose-500"
                    placeholder={`Shkruaj një përshkrim për ${
                      previews[index]?.isVideo ? "videon" : "foton"
                    }...`}
                    value={descriptions[index]}
                    onChange={(e) =>
                      handleDescriptionChange(index, e.target.value)
                    }
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
            disabled={isUploading}
          >
            Anulo
          </button>
          <button
            onClick={handleConfirm}
            className="px-6 py-2 bg-rose-500 text-white rounded-md hover:bg-rose-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isUploading}
          >
            {isUploading ? "Duke ngarkuar..." : "Ngarko"}
          </button>
        </div>
      </div>
    </div>
  );
}

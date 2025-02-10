import { useState, useEffect } from "react";

interface PhotoUploadModalProps {
  files: File[];
  onConfirm: (descriptions: string[]) => void;
  onCancel: () => void;
  isUploading: boolean;
}

interface PreviewImage {
  url: string;
  error: boolean;
}

export function PhotoUploadModal({
  files,
  onConfirm,
  onCancel,
  isUploading,
}: PhotoUploadModalProps) {
  const maxChars = 1500;
  const [descriptions, setDescriptions] = useState<string[]>(
    files.map(() => "")
  );
  const [previews, setPreviews] = useState<PreviewImage[]>([]);

  // Create preview URLs when files change
  useEffect(() => {
    const newPreviews = files.map((file) => ({
      url: URL.createObjectURL(file),
      error: false,
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

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-3xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-serif text-gray-800">Confirm Upload</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {files.map((_file, index) => (
            <div key={index} className="space-y-2">
              <div className="relative rounded-lg overflow-hidden bg-gray-100 h-48">
                {previews[index] && !previews[index].error ? (
                  <img
                    src={previews[index].url}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-contain"
                    onError={() => handlePreviewError(index)}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    Unable to preview image
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label
                    htmlFor={`description-${index}`}
                    className="block text-sm font-medium text-gray-700"
                  >
                    Description for photo {index + 1}
                  </label>
                  <span
                    className={`text-xs ${
                      maxChars - descriptions[index].length < 150
                        ? "text-rose-500"
                        : "text-gray-500"
                    }`}
                  >
                    {maxChars - descriptions[index].length} characters remaining
                  </span>
                </div>
                <textarea
                  id={`description-${index}`}
                  value={descriptions[index]}
                  onChange={(e) =>
                    handleDescriptionChange(index, e.target.value)
                  }
                  maxLength={maxChars}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                  rows={2}
                  placeholder="Write something about this photo..."
                />
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={isUploading}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors disabled:opacity-50"
            disabled={isUploading}
          >
            {isUploading
              ? "Uploading..."
              : `Confirm Upload (${files.length} photos)`}
          </button>
        </div>
      </div>
    </div>
  );
}

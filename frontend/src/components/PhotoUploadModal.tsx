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
      <div className="bg-white rounded-xl max-w-2xl w-full p-6 space-y-6 max-h-[90vh] overflow-y-auto shadow-xl">
        <h3 className="text-2xl font-serif text-gray-800 border-b pb-4">
          Konfirmo Ngarkimin
        </h3>

        <div className="grid grid-cols-1 gap-8">
          {files.map((_file, index) => (
            <div key={index} className="space-y-4">
              <div className="relative rounded-lg overflow-hidden bg-gray-50 h-64 shadow-sm border">
                {previews[index] && !previews[index].error ? (
                  <img
                    src={previews[index].url}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-contain"
                    onError={() => handlePreviewError(index)}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    Nuk mund të shfaqet fotoja
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label
                    htmlFor={`description-${index}`}
                    className="block text-sm font-medium text-gray-700"
                  >
                    Përshkrimi për foton {index + 1}
                  </label>
                  <span
                    className={`text-xs ${
                      maxChars - descriptions[index].length < 150
                        ? "text-rose-500"
                        : "text-gray-400"
                    }`}
                  >
                    {maxChars - descriptions[index].length} karaktere të mbetura
                  </span>
                </div>
                <textarea
                  id={`description-${index}`}
                  value={descriptions[index]}
                  onChange={(e) =>
                    handleDescriptionChange(index, e.target.value)
                  }
                  maxLength={maxChars}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 resize-none transition-shadow"
                  rows={3}
                  placeholder="Shkruaj diçka për këtë foto..."
                />
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t">
          <button
            onClick={onCancel}
            className="px-6 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium"
            disabled={isUploading}
          >
            Anulo
          </button>
          <button
            onClick={handleConfirm}
            className="px-6 py-2.5 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors disabled:opacity-50 font-medium shadow-sm"
            disabled={isUploading}
          >
            {isUploading
              ? "Duke ngarkuar..."
              : `Konfirmo Ngarkimin (${files.length} foto)`}
          </button>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from "react";

interface PhotoUploadModalProps {
  file: File;
  onConfirm: (description: string) => void;
  onCancel: () => void;
  isUploading: boolean;
}

export function PhotoUploadModal({
  file,
  onConfirm,
  onCancel,
  isUploading,
}: PhotoUploadModalProps) {
  const [description, setDescription] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string>(() =>
    URL.createObjectURL(file)
  );

  // Cleanup preview URL when component unmounts
  React.useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleConfirm = () => {
    onConfirm(description);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-lg w-full p-6 space-y-4">
        <h3 className="text-xl font-serif text-gray-800">Confirm Upload</h3>

        <div className="aspect-video relative rounded-lg overflow-hidden bg-gray-100">
          <img
            src={previewUrl}
            alt="Preview"
            className="w-full h-full object-contain"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700"
          >
            Add a description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
            rows={3}
            placeholder="Write something about this photo..."
          />
        </div>

        <div className="flex justify-end gap-3">
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
            {isUploading ? "Uploading..." : "Confirm Upload"}
          </button>
        </div>
      </div>
    </div>
  );
}

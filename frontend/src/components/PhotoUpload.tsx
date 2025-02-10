import React from "react";
import { DragAndDrop } from "./DragAndDrop";
import { usePhotoUpload } from "../hooks/usePhotoUpload";

export const PhotoUpload: React.FC = () => {
  const { selectedFile, uploadStatus, handleFileSelect, uploadPhoto } =
    usePhotoUpload();

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      <DragAndDrop onFileSelect={handleFileSelect}>
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="text-center">
            {selectedFile ? (
              <p className="text-sm">Selected: {selectedFile.name}</p>
            ) : (
              <>
                <p className="text-lg font-medium">Drop your photo here</p>
                <p className="text-sm">or</p>
              </>
            )}
          </div>

          <input
            type="file"
            accept="image/*"
            onChange={handleFileInput}
            className="hidden"
            id="file-input"
          />
          <label
            htmlFor="file-input"
            className="inline-block px-6 py-2.5 bg-blue-500 text-white rounded-md cursor-pointer hover:bg-blue-600 transition-colors"
          >
            Browse Files
          </label>

          {selectedFile && (
            <div className="mt-4">
              <button
                onClick={uploadPhoto}
                disabled={uploadStatus === "uploading"}
                className="px-6 py-2.5 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors disabled:opacity-50"
              >
                {uploadStatus === "uploading" ? "Uploading..." : "Upload Photo"}
              </button>
            </div>
          )}

          {uploadStatus === "success" && (
            <p className="text-green-500">Upload successful!</p>
          )}
          {uploadStatus === "error" && (
            <p className="text-red-500">Upload failed. Please try again.</p>
          )}
        </div>
      </DragAndDrop>
    </div>
  );
};

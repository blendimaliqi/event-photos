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
              <p className="text-sm font-serif italic text-rose-700">
                {selectedFile.name}
              </p>
            ) : (
              <>
                <p className="text-2xl font-serif text-rose-800">
                  Drop your photo here
                </p>
                <div className="flex items-center justify-center gap-4 my-2">
                  <span className="h-px w-12 bg-rose-200"></span>
                  <p className="text-sm font-serif italic text-rose-600">or</p>
                  <span className="h-px w-12 bg-rose-200"></span>
                </div>
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
            className="inline-block px-8 py-3 bg-rose-100 text-rose-800 rounded-full cursor-pointer hover:bg-rose-200 transition-colors font-serif"
          >
            Browse Files
          </label>

          {selectedFile && (
            <div className="mt-4">
              <button
                onClick={uploadPhoto}
                disabled={uploadStatus === "uploading"}
                className="px-8 py-3 bg-rose-600 text-white rounded-full hover:bg-rose-700 transition-colors disabled:opacity-50 font-serif"
              >
                {uploadStatus === "uploading"
                  ? "Uploading..."
                  : "Share This Moment"}
              </button>
            </div>
          )}

          {uploadStatus === "success" && (
            <p className="text-rose-600 font-serif italic">
              Moment shared successfully!
            </p>
          )}
          {uploadStatus === "error" && (
            <p className="text-red-500 font-serif italic">
              Upload failed. Please try again.
            </p>
          )}
        </div>
      </DragAndDrop>
    </div>
  );
};

import React, { useState, useCallback } from "react";
import { FILE_SIZE_LIMITS, formatFileSize } from "../config/constants";

interface FileWithError extends File {
  error?: string;
}

interface DragAndDropProps {
  onFilesDrop: (files: FileList) => void;
  isUploading: boolean;
}

export function DragAndDrop({ onFilesDrop, isUploading }: DragAndDropProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [fileErrors, setFileErrors] = useState<string[]>([]);

  const validateFiles = (files: FileList): boolean => {
    const newErrors: string[] = [];
    let valid = true;

    Array.from(files).forEach((file) => {
      // Check if it's a video file
      if (file.type.startsWith("video/")) {
        // Check if file exceeds maximum size
        if (file.size > FILE_SIZE_LIMITS.MAX_VIDEO_SIZE_BYTES) {
          newErrors.push(
            `Video "${file.name}" exceeds maximum size of ${
              FILE_SIZE_LIMITS.MAX_VIDEO_SIZE_MB
            }MB (${formatFileSize(file.size)})`
          );
          valid = false;
        }
      }
    });

    setFileErrors(newErrors);
    return valid;
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        if (validateFiles(files)) {
          onFilesDrop(files);
        }
      }
    },
    [onFilesDrop]
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      if (validateFiles(files)) {
        onFilesDrop(files);
      }
    }
  };

  return (
    <div className="relative px-6 sm:px-0">
      {fileErrors.length > 0 && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4">
          <p className="font-medium mb-1">File size errors:</p>
          <ul className="text-sm list-disc pl-5">
            {fileErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      <div
        className={`border-2 border-dashed rounded-2xl p-8 sm:p-16 text-center transition-colors min-h-[200px] sm:min-h-[240px] flex flex-col items-center justify-center backdrop-blur-sm focus:outline-none select-none cursor-default ${
          isDragging
            ? "border-rose-400 bg-rose-50/80"
            : "border-rose-200 hover:border-rose-300 bg-white/40"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="text-center">
            <p className="text-xl sm:text-2xl font-serif text-rose-800">
              {isUploading ? (
                "Duke ngarkuar..."
              ) : (
                <span>
                  <span className="hidden sm:inline">Vendos fotot këtu</span>
                  <span className="sm:hidden">Shto fotot e tua</span>
                </span>
              )}
            </p>
            {!isUploading && (
              <div className="flex items-center justify-center gap-4 my-2">
                <span className="hidden sm:block h-px w-8 sm:w-12 bg-rose-200"></span>
                <p className="hidden sm:block text-sm font-serif italic text-rose-600">
                  ose
                </p>
                <span className="hidden sm:block h-px w-8 sm:w-12 bg-rose-200"></span>
              </div>
            )}
          </div>

          {!isUploading && (
            <>
              <input
                type="file"
                accept="image/*,video/*"
                onChange={handleFileInput}
                className="hidden"
                id="file-input"
                multiple
              />
              <label
                htmlFor="file-input"
                className="inline-block px-6 sm:px-8 py-2.5 sm:py-3 bg-rose-100 text-rose-800 rounded-full cursor-pointer hover:bg-rose-200 transition-colors font-serif text-sm sm:text-base"
              >
                Zgjidhni Foto/Video
              </label>
              <div className="text-xs text-gray-500 mt-2">
                Videot duhet të jenë më të vogla se{" "}
                {FILE_SIZE_LIMITS.MAX_VIDEO_SIZE_MB}MB
              </div>
            </>
          )}
        </div>
      </div>
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-rose-50 px-4">
        <span className="text-rose-300 text-2xl">❀</span>
      </div>
      <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-rose-50 px-4">
        <span className="text-rose-300 text-2xl">❀</span>
      </div>
    </div>
  );
}

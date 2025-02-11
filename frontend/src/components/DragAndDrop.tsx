import React, { useState, useCallback } from "react";

interface DragAndDropProps {
  onFilesDrop: (files: FileList) => void;
  isUploading: boolean;
}

export function DragAndDrop({ onFilesDrop, isUploading }: DragAndDropProps) {
  const [isDragging, setIsDragging] = useState(false);

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
        onFilesDrop(files);
      }
    },
    [onFilesDrop]
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFilesDrop(files);
    }
  };

  return (
    <div className="relative px-6 sm:px-0">
      <div
        className={`border-2 border-dashed rounded-2xl p-8 sm:p-16 text-center transition-colors min-h-[200px] sm:min-h-[240px] flex items-center justify-center backdrop-blur-sm ${
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
                <span className="h-px w-8 sm:w-12 bg-rose-200"></span>
                <p className="text-sm font-serif italic text-rose-600">ose</p>
                <span className="h-px w-8 sm:w-12 bg-rose-200"></span>
              </div>
            )}
          </div>

          {!isUploading && (
            <>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileInput}
                className="hidden"
                id="file-input"
                multiple
              />
              <label
                htmlFor="file-input"
                className="inline-block px-6 sm:px-8 py-2.5 sm:py-3 bg-rose-100 text-rose-800 rounded-full cursor-pointer hover:bg-rose-200 transition-colors font-serif text-sm sm:text-base"
              >
                Zgjidhni Foto
              </label>
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

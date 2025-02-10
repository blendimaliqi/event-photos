import React, { useState, useCallback } from "react";

interface DragAndDropProps {
  onFileSelect: (file: File) => void;
  children: React.ReactNode;
}

export const DragAndDrop: React.FC<DragAndDropProps> = ({
  onFileSelect,
  children,
}) => {
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

      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith("image/")) {
        onFileSelect(file);
      }
    },
    [onFileSelect]
  );

  return (
    <div className="relative">
      <div
        className={`border-2 border-dashed rounded-2xl p-16 text-center transition-colors min-h-[240px] flex items-center justify-center backdrop-blur-sm ${
          isDragging
            ? "border-rose-400 bg-rose-50/80"
            : "border-rose-200 hover:border-rose-300 bg-white/40"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {children}
      </div>
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-rose-50 px-4">
        <span className="text-rose-300 text-2xl">❀</span>
      </div>
      <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-rose-50 px-4">
        <span className="text-rose-300 text-2xl">❀</span>
      </div>
    </div>
  );
};

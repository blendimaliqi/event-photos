import React from "react";
import { Photo } from "../types/photo";

interface PhotoContentProps {
  photo: Photo;
  onExpand?: () => void;
  isExpanded?: boolean;
  isCompact?: boolean;
}

export const PhotoContent: React.FC<PhotoContentProps> = ({
  photo,
  onExpand,
  isExpanded,
  isCompact,
}) => {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4">
      <div className="flex justify-between items-start">
        <p className="text-sm text-gray-600">
          {new Date(photo.uploadDate).toLocaleDateString()}{" "}
          {new Date(photo.uploadDate).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onExpand?.();
          }}
          className="text-rose-600 hover:text-rose-700 transition-colors"
          title={isExpanded ? "Minimize photo" : "Expand photo"}
        >
          {isExpanded ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15"
              />
            </svg>
          )}
        </button>
      </div>
      {!isCompact && photo.description && (
        <div className="relative mt-2">
          <div
            className={`text-gray-700 whitespace-pre-wrap break-words ${
              photo.description.length > 100
                ? "max-h-32 overflow-y-auto pr-2 custom-scrollbar"
                : ""
            }`}
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "#fecdd3 transparent",
            }}
          >
            {photo.description}
          </div>
        </div>
      )}
    </div>
  );
};

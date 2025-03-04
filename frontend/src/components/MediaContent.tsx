import React, { useState, useEffect } from "react";
import { Media } from "../types/media";
import { config } from "../config/config";

interface MediaContentProps {
  media: Media;
  onExpand?: () => void;
  onToggleCollapse?: () => void;
  isExpanded?: boolean;
  isCompact?: boolean;
  isCollapsed?: boolean;
}

export const MediaContent: React.FC<MediaContentProps> = ({
  media,
  onExpand,
  onToggleCollapse,
  isExpanded,
  isCompact,
  isCollapsed: propIsCollapsed,
}) => {
  const [isMobile, setIsMobile] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(!media.description);

  useEffect(() => {
    if (propIsCollapsed !== undefined) {
      setIsCollapsed(propIsCollapsed);
    }
  }, [propIsCollapsed]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const renderMediaContent = () => {
    const mediaUrl = config.getImageUrl(media.url);

    if (media.type === "video") {
      return (
        <div className="relative w-full h-full">
          <video
            controls
            className="w-full h-full object-contain"
            preload="none"
            playsInline
            src={mediaUrl}
            poster={config.getVideoThumbnailUrl(media.url)}
          >
            <source src={mediaUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      );
    } else {
      return (
        <img
          src={mediaUrl}
          alt={media.description || "Photo"}
          className="w-full h-full object-contain"
        />
      );
    }
  };

  return (
    <div
      className={`bg-white backdrop-blur-sm rounded-lg ${
        isExpanded ? "h-full flex flex-col" : "p-3"
      }`}
    >
      <div className={isExpanded ? "flex-1 min-h-0" : ""}>
        <div
          className={`${
            isExpanded ? "h-full" : "max-h-32"
          } overflow-y-auto custom-scrollbar ${isExpanded ? "p-6" : ""} ${
            isCompact ? "flex items-center justify-center h-full" : "pr-4"
          }`}
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "#fecdd3 transparent",
          }}
        >
          <div
            className={`flex ${
              isCompact ? "justify-center w-full" : "items-center mb-2"
            }`}
          >
            {(!isCompact || isExpanded) && (
              <p className="text-sm text-gray-600 flex-1 mr-2">
                {new Date(media.uploadDate).toLocaleDateString()}{" "}
                {!isCompact &&
                  new Date(media.uploadDate).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
              </p>
            )}
            {(!isExpanded || (isExpanded && onToggleCollapse && isMobile)) && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isExpanded) {
                    onExpand?.();
                  } else {
                    onToggleCollapse?.();
                  }
                }}
                className={`text-rose-600 hover:text-rose-700 transition-colors flex-shrink-0 ${
                  isExpanded ? "sm:hidden" : ""
                }`}
                title={
                  !isExpanded
                    ? "Expand media"
                    : isCollapsed
                    ? "Show more"
                    : "Show less"
                }
              >
                {!isExpanded ? (
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
                ) : isCollapsed ? (
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
                      d="M19.5 8.25l-7.5 7.5-7.5-7.5"
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
                      d="M4.5 15.75l7.5-7.5 7.5 7.5"
                    />
                  </svg>
                )}
              </button>
            )}
          </div>

          {/* Media content (photo or video) */}
          {!isExpanded && (
            <div className="relative w-full aspect-video mb-3">
              {renderMediaContent()}
              {media.type === "video" && (
                <div className="absolute top-2 right-2 bg-black/60 text-white px-2 py-1 rounded-md text-xs">
                  Video
                </div>
              )}
            </div>
          )}
          {media.description && (
            <div
              className={`mt-2 text-gray-700 ${
                isCollapsed && !isExpanded ? "line-clamp-2" : ""
              }`}
            >
              {media.description}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

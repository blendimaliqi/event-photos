import React, { useState, useEffect } from "react";
import { Photo } from "../types/photo";

interface PhotoContentProps {
  photo: Photo;
  onExpand?: () => void;
  onToggleCollapse?: () => void;
  isExpanded?: boolean;
  isCompact?: boolean;
  isCollapsed?: boolean;
}

export const PhotoContent: React.FC<PhotoContentProps> = ({
  photo,
  onExpand,
  onToggleCollapse,
  isExpanded,
  isCompact,
  isCollapsed: propIsCollapsed,
}) => {
  const [isMobile, setIsMobile] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(!photo.description);

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
          } overflow-y-auto pr-4 custom-scrollbar ${isExpanded ? "p-6" : ""}`}
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "#fecdd3 transparent",
          }}
        >
          <div
            className={`flex ${
              isCompact ? "justify-end" : "items-center mb-2"
            }`}
          >
            {(!isCompact || isExpanded) && (
              <p className="text-sm text-gray-600 flex-1 mr-2">
                {new Date(photo.uploadDate).toLocaleDateString()}{" "}
                {!isCompact &&
                  new Date(photo.uploadDate).toLocaleTimeString([], {
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
                    ? "Expand photo"
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
                      d={
                        isCollapsed
                          ? "M4.5 15.75l7.5-7.5 7.5 7.5"
                          : "M19.5 8.25l-7.5 7.5-7.5-7.5"
                      }
                    />
                  </svg>
                )}
              </button>
            )}
          </div>
          {(!isCompact || isExpanded) && (
            <div
              className={`text-gray-600 whitespace-pre-wrap break-words text-sm px-1 ${
                !isExpanded && isCollapsed ? "line-clamp-2" : ""
              }`}
            >
              {photo.description || ""}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

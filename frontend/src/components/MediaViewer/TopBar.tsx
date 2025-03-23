import React from "react";

interface TopBarProps {
  currentIndex: number;
  mediaCount: number;
  isVideo: boolean;
  isFullscreen: boolean;
  isMuted: boolean;
  showThumbnails: boolean;
  showDescription: boolean;
  hasDescription: boolean;
  toggleMute: () => void;
  toggleDescription: () => void;
  toggleFullscreen: () => void;
  toggleThumbnails: () => void;
  handleDownload: (e: React.MouseEvent) => void;
  handleClose: () => void;
}

const TopBar: React.FC<TopBarProps> = ({
  currentIndex,
  mediaCount,
  isVideo,
  isFullscreen,
  isMuted,
  showThumbnails,
  showDescription,
  hasDescription,
  toggleMute,
  toggleDescription,
  toggleFullscreen,
  toggleThumbnails,
  handleDownload,
  handleClose,
}) => {
  return (
    <div
      className={`absolute top-0 left-0 right-0 z-30 bg-gradient-to-b from-black/80 to-transparent py-4 transition-opacity duration-300 ${
        isFullscreen ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      <div className="max-w-screen-xl mx-auto px-4 flex items-center justify-between">
        <div className="text-white text-sm font-medium pointer-events-none">
          {currentIndex + 1} / {mediaCount}
        </div>

        <div className="flex items-center gap-3 ml-auto">
          {/* Sound mute/unmute button for videos */}
          {isVideo && (
            <button
              onClick={toggleMute}
              className="bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
              aria-label={isMuted ? "Unmute" : "Mute"}
              title={`${isMuted ? "Unmute" : "Mute"} (M)`}
            >
              {isMuted ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                    clipRule="evenodd"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                  />
                </svg>
              )}
            </button>
          )}
          {hasDescription && (
            <button
              onClick={toggleDescription}
              className={`text-white p-2 rounded-full transition-colors ${
                showDescription
                  ? "bg-white/30"
                  : "bg-black/50 hover:bg-black/70"
              }`}
              aria-label="Toggle description"
              title="Toggle description (D)"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h7"
                />
              </svg>
            </button>
          )}

          {/* Fullscreen toggle button */}
          {!isVideo && (
            <button
              onClick={toggleFullscreen}
              className={`text-white p-2 rounded-full transition-colors ${
                isFullscreen ? "bg-white/30" : "bg-black/50 hover:bg-black/70"
              }`}
              aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
              title={`${isFullscreen ? "Exit" : "Enter"} fullscreen (F)`}
            >
              {isFullscreen ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5M15 15l5.25 5.25"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5"
                  />
                </svg>
              )}
            </button>
          )}

          <button
            onClick={toggleThumbnails}
            className={`text-white p-2 rounded-full transition-colors ${
              showThumbnails ? "bg-white/30" : "bg-black/50 hover:bg-black/70"
            }`}
            aria-label="Toggle thumbnails"
            title="Toggle thumbnails (T)"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 10h16M4 14h16M4 18h16"
              />
            </svg>
          </button>

          <button
            onClick={handleDownload}
            className="bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
            aria-label="Download media"
            title="Download media"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
          </button>
          <button
            onClick={handleClose}
            className="bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
            aria-label="Close gallery"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TopBar;

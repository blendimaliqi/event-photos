import { useState, useEffect, useCallback } from "react";
import { Media } from "../types/media";

interface MediaViewerProps {
  initialMedia: Media;
  mediaItems: Media[];
  onClose: () => void;
}

const MediaViewer = ({
  initialMedia,
  mediaItems,
  onClose,
}: MediaViewerProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isClosing, setIsClosing] = useState(false);
  const [showThumbnails, setShowThumbnails] = useState(true);

  useEffect(() => {
    // Find the index of the initially selected media
    const index = mediaItems.findIndex(
      (item) => item.id === initialMedia.id && item.type === initialMedia.type
    );
    setCurrentIndex(index >= 0 ? index : 0);
  }, [initialMedia, mediaItems]);

  const currentMedia = mediaItems[currentIndex];

  const handlePrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : mediaItems.length - 1));
    setIsLoading(true);
  }, [mediaItems.length]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev < mediaItems.length - 1 ? prev + 1 : 0));
    setIsLoading(true);
  }, [mediaItems.length]);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 200);
  }, [onClose]);

  const handleThumbnailClick = (index: number) => {
    if (index !== currentIndex) {
      setCurrentIndex(index);
      setIsLoading(true);
    }
  };

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  // Update browser URL with current media info for sharing/bookmarking
  useEffect(() => {
    if (currentMedia) {
      // Update the URL without causing a page reload
      window.history.replaceState(
        null,
        "",
        `/${currentMedia.type}/${currentMedia.id}`
      );
    }
  }, [currentMedia]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        handlePrevious();
      } else if (e.key === "ArrowRight") {
        handleNext();
      } else if (e.key === "Escape") {
        handleClose();
      } else if (e.key === "t" || e.key === "T") {
        setShowThumbnails((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handlePrevious, handleNext, handleClose]);

  if (!currentMedia) return null;

  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-90 z-50 flex flex-col items-center justify-center transition-opacity duration-200 ${
        isClosing ? "opacity-0" : "opacity-100"
      }`}
      onClick={(e) => {
        // Close viewer when clicking on the background
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
    >
      {/* Top bar with controls */}
      <div className="absolute top-0 left-0 right-0 z-30 bg-gradient-to-b from-black/80 to-transparent py-4">
        <div className="max-w-screen-xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={handleClose}
              className="bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
              aria-label="Back to gallery"
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
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
            </button>
            <div className="text-white text-sm font-medium">
              {currentIndex + 1} / {mediaItems.length}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowThumbnails((prev) => !prev)}
              className={`text-white p-2 rounded-full transition-colors ${
                showThumbnails ? "bg-white/30" : "bg-black/50 hover:bg-black/70"
              }`}
              aria-label="Toggle thumbnails"
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
                  d="M4 6h16M4 12h16m-7 6h7"
                />
              </svg>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                // Create a temporary anchor to download the image/video
                const link = document.createElement("a");
                link.href = currentMedia.url;
                link.download =
                  currentMedia.url.split("/").pop() ||
                  `${currentMedia.type}-${currentMedia.id}`;
                link.click();
              }}
              className="bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
              aria-label="Download media"
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

      {/* Main content */}
      <div className="relative w-full h-full flex items-center justify-center p-4 z-20">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center z-30">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-white border-t-transparent"></div>
          </div>
        )}

        <div
          className={`transition-opacity duration-300 ${
            isLoading ? "opacity-30" : "opacity-100"
          } max-w-full max-h-[calc(100vh-180px)] relative`}
        >
          {currentMedia.type === "photo" ? (
            <img
              src={currentMedia.url}
              alt={currentMedia.description || "Photo"}
              className="max-h-[calc(100vh-180px)] max-w-full object-contain rounded shadow-lg"
              onLoad={handleImageLoad}
            />
          ) : (
            <video
              src={currentMedia.url}
              poster={currentMedia.thumbnailUrl}
              className="max-h-[calc(100vh-180px)] max-w-full rounded shadow-lg"
              controls
              autoPlay
              onLoadedData={handleImageLoad}
            >
              Your browser does not support the video tag.
            </video>
          )}
        </div>
      </div>

      {/* Navigation controls */}
      <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between pointer-events-none z-20">
        <button
          className="pointer-events-auto bg-black/50 hover:bg-black/70 text-white p-2 ml-4 rounded-full w-12 h-12 flex items-center justify-center transition-transform transform hover:scale-105 focus:outline-none shadow-lg"
          onClick={handlePrevious}
          aria-label="Previous"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-7 w-7"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        <button
          className="pointer-events-auto bg-black/50 hover:bg-black/70 text-white p-2 mr-4 rounded-full w-12 h-12 flex items-center justify-center transition-transform transform hover:scale-105 focus:outline-none shadow-lg"
          onClick={handleNext}
          aria-label="Next"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-7 w-7"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>

      {/* Description */}
      {currentMedia.description && (
        <div className="absolute bottom-[100px] left-0 right-0 bg-black/75 py-3 px-4 z-20">
          <div className="text-white text-center max-w-3xl mx-auto">
            {currentMedia.description}
          </div>
        </div>
      )}

      {/* Thumbnails gallery */}
      <div
        className={`absolute bottom-0 left-0 right-0 bg-black/80 z-30 transition-transform duration-300 ${
          showThumbnails ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="max-w-screen-xl mx-auto p-3">
          <div className="overflow-x-auto">
            <div className="flex gap-2 pb-1">
              {mediaItems.map((media, idx) => (
                <div
                  key={`thumb-${media.type}-${media.id}`}
                  className={`flex-shrink-0 w-16 h-16 cursor-pointer transition-all rounded overflow-hidden ${
                    idx === currentIndex
                      ? "ring-2 ring-white scale-110"
                      : "opacity-70 hover:opacity-100"
                  }`}
                  onClick={() => handleThumbnailClick(idx)}
                >
                  {media.type === "photo" ? (
                    <img
                      src={media.url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="relative w-full h-full">
                      <img
                        src={media.thumbnailUrl || ""}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-0.5 right-0.5 bg-black/70 rounded-full flex items-center justify-center w-4 h-4">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-2.5 w-2.5 text-white"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediaViewer;

import { useState, useEffect, useCallback, useRef } from "react";
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
  const [showDescription, setShowDescription] = useState(true);
  const [isMuted, setIsMuted] = useState(true);

  // Touch swiping state
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchEndX, setTouchEndX] = useState(0);
  const [swiping, setSwiping] = useState(false);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isAnimatingSwipe, setIsAnimatingSwipe] = useState(false);
  const [touchCount, setTouchCount] = useState(0);
  const swipeThreshold = 100; // Minimum px to swipe to trigger next/previous
  const mainContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Find the index of the initially selected media
    const index = mediaItems.findIndex(
      (item) => item.id === initialMedia.id && item.type === initialMedia.type
    );
    setCurrentIndex(index >= 0 ? index : 0);
  }, [initialMedia, mediaItems]);

  const currentMedia = mediaItems[currentIndex];

  // Calculate what the next and previous media items will be
  const nextIndex = currentIndex < mediaItems.length - 1 ? currentIndex + 1 : 0;
  const prevIndex = currentIndex > 0 ? currentIndex - 1 : mediaItems.length - 1;
  const nextMedia = mediaItems[nextIndex];
  const prevMedia = mediaItems[prevIndex];

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

  const toggleDescription = () => {
    setShowDescription((prev) => !prev);
  };

  const toggleMute = () => {
    setIsMuted((prev) => !prev);
  };

  // Swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    // Don't start swiping if we have multiple fingers (zooming)
    const touches = e.touches.length;
    setTouchCount(touches);

    if (touches > 1) return;

    setTouchStartX(e.touches[0].clientX);
    setTouchEndX(e.touches[0].clientX);
    setSwiping(true);
    setSwipeOffset(0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    // Don't handle swipe if not swiping or if multiple fingers are used
    if (!swiping || e.touches.length > 1) {
      setTouchCount(e.touches.length);
      return;
    }

    // If we're in the middle of a swipe animation, don't allow more swiping
    if (isAnimatingSwipe) return;

    setTouchEndX(e.touches[0].clientX);
    const newOffset = touchEndX - touchStartX;

    // Apply resistance at the edges for better feel
    const maxOffset = window.innerWidth * 0.5;
    const dampedOffset =
      Math.sign(newOffset) * Math.min(Math.abs(newOffset), maxOffset);

    setSwipeOffset(dampedOffset);

    // Prevent scrolling the page while swiping
    if (Math.abs(dampedOffset) > 10) {
      e.preventDefault();
    }
  };

  const handleTouchEnd = () => {
    // Skip if not swiping or using multiple fingers
    if (!swiping || touchCount > 1) {
      setTouchCount(0);
      return;
    }

    // If we're in the middle of a swipe animation, don't allow more swiping
    if (isAnimatingSwipe) return;

    const distance = touchEndX - touchStartX;

    // If swipe distance exceeds threshold, navigate with animation
    if (Math.abs(distance) > swipeThreshold) {
      // Start animation
      setIsAnimatingSwipe(true);

      // Set full screen width offset in direction of swipe for smooth animation
      const targetOffset = Math.sign(distance) * window.innerWidth;
      setSwipeOffset(targetOffset);

      // Wait for animation to complete, then navigate and reset
      setTimeout(() => {
        // Immediately disable all animations before changing the index
        setIsAnimatingSwipe(false);

        // Change the image index
        if (distance > 0) {
          handlePrevious();
        } else {
          handleNext();
        }

        // Reset the swipe state without any animation
        setSwiping(false);
        setSwipeOffset(0);
        setTouchCount(0);
      }, 300);
    } else {
      // If not exceeding threshold, animate back to original position
      setIsAnimatingSwipe(true);
      setSwipeOffset(0);

      // Reset after spring-back animation
      setTimeout(() => {
        setSwiping(false);
        setIsAnimatingSwipe(false);
        setTouchCount(0);
      }, 300);
    }
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
      } else if (e.key === "d" || e.key === "D") {
        setShowDescription((prev) => !prev);
      } else if (e.key === "m" || e.key === "M") {
        toggleMute();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handlePrevious, handleNext, handleClose]);

  if (!currentMedia) return null;

  // Determine if we should show the description
  const hasDescription = !!currentMedia.description;
  const isVideo = currentMedia.type === "video";

  // Calculate swipe effect styles - smooth transitions
  const swipeTransform =
    swiping || isAnimatingSwipe
      ? `translateX(${swipeOffset}px)`
      : "translateX(0)";

  // Use a smoother transition when animating the swipe finish
  const swipeTransition = isAnimatingSwipe
    ? "transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)"
    : swiping
    ? "none"
    : "transform 0.3s ease-out";

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
            <button
              onClick={() => setShowThumbnails((prev) => !prev)}
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

      {/* Main content with swipe support */}
      <div
        ref={mainContentRef}
        className="relative w-full h-full flex items-center justify-center p-4 z-20 overflow-hidden touch-manipulation"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center z-30">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-white border-t-transparent"></div>
          </div>
        )}

        {/* Swipeable content container */}
        <div
          className={`absolute inset-0 flex items-center justify-center ${
            isAnimatingSwipe ? "transition-transform duration-300 ease-out" : ""
          }`}
          style={{ transform: swipeTransform }}
        >
          {/* Previous media (only visible during swipe) */}
          {swiping && swipeOffset > 0 && (
            <div className="absolute inset-0 flex items-center justify-center opacity-70 -translate-x-full">
              {prevMedia.type === "photo" ? (
                <img
                  src={prevMedia.url}
                  alt=""
                  className="max-h-[calc(100vh-180px)] max-w-full object-contain rounded shadow-lg"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <img
                    src={prevMedia.thumbnailUrl || ""}
                    alt=""
                    className="max-h-[calc(100vh-180px)] max-w-full object-contain rounded shadow-lg"
                  />
                </div>
              )}
            </div>
          )}

          {/* Current media */}
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
                loop={false}
                muted={isMuted}
                onLoadedMetadata={handleImageLoad}
                preload="metadata"
              >
                Your browser does not support the video tag.
              </video>
            )}
          </div>

          {/* Next media (only visible during swipe) */}
          {swiping && swipeOffset < 0 && (
            <div className="absolute inset-0 flex items-center justify-center opacity-70 translate-x-full">
              {nextMedia.type === "photo" ? (
                <img
                  src={nextMedia.url}
                  alt=""
                  className="max-h-[calc(100vh-180px)] max-w-full object-contain rounded shadow-lg"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <img
                    src={nextMedia.thumbnailUrl || ""}
                    alt=""
                    className="max-h-[calc(100vh-180px)] max-w-full object-contain rounded shadow-lg"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Swipe indicators */}
        {swiping && (
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none z-30">
            {swipeOffset > 20 && (
              <div className="bg-white/20 rounded-full p-3 ml-6 backdrop-blur-sm">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-white"
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
              </div>
            )}

            {swipeOffset < -20 && (
              <div className="bg-white/20 rounded-full p-3 mr-6 ml-auto backdrop-blur-sm">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-white"
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
              </div>
            )}
          </div>
        )}
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

      {/* Description panel - improved with toggle and better styling */}
      {currentMedia.description && showDescription && (
        <div className="absolute bottom-[100px] left-1/2 transform -translate-x-1/2 z-20 transition-opacity duration-300 ease-in-out">
          <div className="bg-black/75 rounded-lg shadow-lg overflow-hidden max-w-3xl w-[95vw] backdrop-blur-sm">
            <div className="flex items-center justify-between px-4 py-2 bg-black/50">
              <h3 className="text-white text-sm font-medium">Mesazh</h3>
              <button
                onClick={toggleDescription}
                className="text-white/80 hover:text-white p-1 rounded-full"
                aria-label="Close description"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
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
            <div className="p-4 text-white max-h-[25vh] overflow-y-auto">
              {currentMedia.description}
            </div>
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

      {/* Floating description toggle button when description is hidden */}
      {currentMedia.description && !showDescription && (
        <button
          onClick={toggleDescription}
          className="absolute bottom-[120px] right-4 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full shadow-lg z-30"
          aria-label="Show description"
          title="Show description (D)"
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
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </button>
      )}
    </div>
  );
};

export default MediaViewer;

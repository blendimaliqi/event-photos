import { useState, useEffect, useCallback, useRef } from "react";
import { Media } from "../../types/media";
import TopBar from "./TopBar";
import MediaContent from "./MediaContent";
import NavigationControls from "./NavigationControls";
import DescriptionPanel from "./DescriptionPanel";
import ThumbnailsGallery from "./ThumbnailsGallery";
import SwipeHandler from "./SwipeHandler";

import FloatingDescriptionButton from "./FloatingDescriptionButton";
import LoadingIndicator from "./LoadingIndicator";
import FullScreenIndicator from "./FullscreenIndicator";

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
  const [showThumbnails, setShowThumbnails] = useState(
    () => initialMedia.type === "photo"
  );
  const [thumbnailUserPreference, setThumbnailUserPreference] = useState(true);
  const [showDescription, setShowDescription] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showFullscreenIndicator, setShowFullscreenIndicator] = useState(false);

  // Touch swiping state
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchEndX, setTouchEndX] = useState(0);
  const [swiping, setSwiping] = useState(false);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isAnimatingSwipe, setIsAnimatingSwipe] = useState(false);
  const [touchCount, setTouchCount] = useState(0);
  const swipeThreshold = 100; // Minimum px to swipe to trigger next/previous
  const mainContentRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const thumbnailsContainerRef = useRef<HTMLDivElement>(null);
  const thumbnailRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Handle thumbnail visibility and toggling
  const toggleThumbnails = useCallback((e?: React.MouseEvent) => {
    if (e) e.preventDefault();

    // Update both the visibility state and user preference
    setShowThumbnails((prev) => !prev);
    setThumbnailUserPreference((prev) => !prev);
  }, []);

  // Effect to prevent body scrolling when viewer is open
  useEffect(() => {
    // Save the original overflow style
    const originalStyle = window.getComputedStyle(document.body).overflow;

    // Prevent scrolling on body when the viewer is open
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.width = "100%";
    document.body.style.height = "100%";

    // Restore original style when component unmounts
    return () => {
      document.body.style.overflow = originalStyle;
      document.body.style.position = "";
      document.body.style.width = "";
      document.body.style.height = "";
    };
  }, []);

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

  const toggleFullscreen = () => {
    setIsFullscreen((prev) => !prev);
    setShowFullscreenIndicator(true);
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Create a temporary anchor to download the image/video
    const link = document.createElement("a");
    link.href = currentMedia.url;
    link.download =
      currentMedia.url.split("/").pop() ||
      `${currentMedia.type}-${currentMedia.id}`;
    link.click();
  };

  // Effect to handle fullscreen indicator timeout
  useEffect(() => {
    if (showFullscreenIndicator) {
      const timer = setTimeout(() => {
        setShowFullscreenIndicator(false);
      }, 3000); // Hide after 3 seconds
      return () => clearTimeout(timer);
    }
  }, [showFullscreenIndicator]);

  // Swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    // Don't start swiping if interacting with video or video controls
    const target = e.target as HTMLElement;

    // Get the video element if touch is on video or a child of video
    const videoElement =
      target.tagName === "VIDEO"
        ? target
        : (target.closest("video") as HTMLElement);

    if (videoElement) {
      // Check if touch is in the bottom portion of the video (likely controls area)
      const videoRect = videoElement.getBoundingClientRect();
      const touchY = e.touches[0].clientY;

      // Controls are typically in the bottom ~15% of the video
      const controlsAreaThreshold = videoRect.height * 0.85;
      const isTouchingControls = touchY > videoRect.top + controlsAreaThreshold;

      // Skip swiping only if touching the controls area
      if (isTouchingControls) {
        return;
      }
    }

    // Continue with normal swiping logic for center of video or non-video elements
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
    // Check if touch is happening on video controls
    const target = e.target as HTMLElement;

    // Only check for video controls if we're not already swiping
    if (!swiping) {
      const videoElement =
        target.tagName === "VIDEO"
          ? target
          : (target.closest("video") as HTMLElement);

      if (videoElement) {
        // Check if touch is in the bottom controls area
        const videoRect = videoElement.getBoundingClientRect();
        const touchY = e.touches[0].clientY;

        // Controls are typically in bottom 15% of video
        const controlsAreaThreshold = videoRect.height * 0.85;
        const isTouchingControls =
          touchY > videoRect.top + controlsAreaThreshold;

        if (isTouchingControls) {
          return;
        }
      }
    }

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
    e.preventDefault();
  };

  const handleTouchEnd = () => {
    // Only check for controls if not already swiping
    if (!swiping) return;

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
      // Get current media type for key shortcuts that depend on media type
      const isCurrentVideo = currentMedia?.type === "video";

      if (e.key === "ArrowLeft") {
        handlePrevious();
      } else if (e.key === "ArrowRight") {
        handleNext();
      } else if (e.key === "Escape") {
        if (isFullscreen) {
          setIsFullscreen(false);
        } else {
          handleClose();
        }
      } else if (e.key === "t" || e.key === "T") {
        // Use the toggleThumbnails function
        toggleThumbnails();
      } else if (e.key === "d" || e.key === "D") {
        setShowDescription((prev) => !prev);
      } else if (e.key === "m" || e.key === "M") {
        toggleMute();
      } else if ((e.key === "f" || e.key === "F") && !isCurrentVideo) {
        // Only toggle fullscreen for photos, not videos
        toggleFullscreen();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    handlePrevious,
    handleNext,
    handleClose,
    isFullscreen,
    currentMedia,
    toggleThumbnails,
  ]);

  // Effect to handle video-specific UI adjustments
  useEffect(() => {
    const isCurrentVideo = currentMedia?.type === "video";
    const isCurrentPhoto = currentMedia?.type === "photo";

    if (isCurrentVideo) {
      // Always hide thumbnails for videos
      setShowThumbnails(false);
    } else if (isCurrentPhoto && thumbnailUserPreference) {
      // Show thumbnails for photos only if user hasn't manually turned them off
      setShowThumbnails(true);
    }

    // Exit fullscreen when navigating to a video
    if (isCurrentVideo && isFullscreen) {
      setIsFullscreen(false);
    }
  }, [currentIndex, currentMedia, isFullscreen, thumbnailUserPreference]);

  // Effect to scroll the selected thumbnail into view when current index changes
  useEffect(() => {
    if (
      thumbnailsContainerRef.current &&
      thumbnailRefs.current[currentIndex] &&
      showThumbnails
    ) {
      const container = thumbnailsContainerRef.current;
      const thumbnail = thumbnailRefs.current[currentIndex];

      // Get positions
      const containerRect = container.getBoundingClientRect();
      const thumbnailRect = thumbnail.getBoundingClientRect();

      // Check if thumbnail is not fully visible
      const isNotFullyVisible =
        thumbnailRect.left < containerRect.left ||
        thumbnailRect.right > containerRect.right;

      if (isNotFullyVisible) {
        // Scroll the thumbnail into view with smooth animation
        thumbnail.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
      }
    }
  }, [currentIndex, showThumbnails]);

  // Effect to initialize thumbnail refs
  useEffect(() => {
    // Create refs for each thumbnail
    thumbnailRefs.current = Array(mediaItems.length).fill(null);
  }, [mediaItems.length]);

  // Effect to ensure videos are properly paused when changing media
  useEffect(() => {
    // Reset video state when navigating to ensure controls show correctly
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0; // Reset to beginning

      // Force browser to reset control UI
      const refreshControls = () => {
        if (videoRef.current) {
          // Small timeout to ensure browser updates UI
          setTimeout(() => {
            if (videoRef.current) {
              videoRef.current.load();

              // Force browser to update pause/play button state
              const videoElement = videoRef.current;

              // Create and dispatch a pause event to ensure UI reflects paused state
              const pauseEvent = new Event("pause", { bubbles: true });
              videoElement.dispatchEvent(pauseEvent);

              // For some browsers that might not properly update with just the event
              if (videoElement.paused === false) {
                videoElement.pause();
              }
            }
          }, 10);
        }
      };

      refreshControls();
    }
  }, [currentIndex]);

  if (!currentMedia) return null;

  // Determine if we should show the description
  const hasDescription = !!currentMedia.description;
  const isVideo = currentMedia.type === "video";

  // Calculate swipe effect styles - smooth transitions
  const swipeTransform =
    swiping || isAnimatingSwipe
      ? `translateX(${swipeOffset}px)`
      : "translateX(0)";

  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-90 z-50 flex flex-col items-center justify-center transition-opacity duration-200 overflow-hidden ${
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
      <TopBar
        currentIndex={currentIndex}
        mediaCount={mediaItems.length}
        isVideo={isVideo}
        isFullscreen={isFullscreen}
        isMuted={isMuted}
        showThumbnails={showThumbnails}
        showDescription={showDescription}
        hasDescription={hasDescription}
        toggleMute={toggleMute}
        toggleDescription={toggleDescription}
        toggleFullscreen={toggleFullscreen}
        toggleThumbnails={toggleThumbnails}
        handleDownload={handleDownload}
        handleClose={handleClose}
      />

      {/* Main content with swipe support */}
      <div
        ref={mainContentRef}
        className="relative w-full h-full flex items-center justify-center p-4 z-20 overflow-hidden touch-manipulation"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <LoadingIndicator isLoading={isLoading} />

        <SwipeHandler
          swiping={swiping}
          swipeOffset={swipeOffset}
          isAnimatingSwipe={isAnimatingSwipe}
          swipeTransform={swipeTransform}
          prevMedia={prevMedia}
          nextMedia={nextMedia}
          isFullscreen={isFullscreen}
        >
          <MediaContent
            currentMedia={currentMedia}
            isVideo={isVideo}
            isLoading={isLoading}
            isFullscreen={isFullscreen}
            isMuted={isMuted}
            videoRef={videoRef}
            handleImageLoad={handleImageLoad}
            toggleFullscreen={toggleFullscreen}
          />
        </SwipeHandler>

        <FullScreenIndicator
          isFullscreen={isFullscreen}
          showFullscreenIndicator={showFullscreenIndicator}
        />
      </div>

      {/* Navigation controls */}
      <NavigationControls
        isFullscreen={isFullscreen}
        handlePrevious={handlePrevious}
        handleNext={handleNext}
      />

      {/* Description panel */}
      <DescriptionPanel
        description={currentMedia.description}
        showDescription={showDescription}
        isFullscreen={isFullscreen}
        toggleDescription={toggleDescription}
      />

      {/* Thumbnails gallery */}
      <ThumbnailsGallery
        mediaItems={mediaItems}
        currentIndex={currentIndex}
        showThumbnails={showThumbnails}
        isFullscreen={isFullscreen}
        thumbnailsContainerRef={thumbnailsContainerRef}
        thumbnailRefs={thumbnailRefs}
        handleThumbnailClick={handleThumbnailClick}
      />

      {/* Floating description toggle button */}
      <FloatingDescriptionButton
        hasDescription={hasDescription}
        showDescription={showDescription}
        isFullscreen={isFullscreen}
        toggleDescription={toggleDescription}
      />
    </div>
  );
};

export default MediaViewer;

import React, { useState, useCallback, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useGesture } from "react-use-gesture";
import { config } from "../config/config";

interface PhotoViewProps {
  cards: {
    id: number;
    content: React.ReactElement;
    className: string;
    thumbnail: string;
    type?: "photo" | "video";
  }[];
}

export const PhotoView: React.FC<PhotoViewProps> = ({ cards }) => {
  console.log("PhotoView: Rendering with", cards.length, "cards");
  const navigate = useNavigate();
  const { photoId } = useParams();
  console.log("PhotoView: photoId from params:", photoId);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isDescriptionCollapsed, setIsDescriptionCollapsed] = useState(false);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const touchLayerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const swipeThreshold = 80;
  const windowWidth = typeof window !== "undefined" ? window.innerWidth : 0;
  const [prevImageLoaded, setPrevImageLoaded] = useState(false);
  const [nextImageLoaded, setNextImageLoaded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isCounterVisible, setIsCounterVisible] = useState(false);
  const counterTimeoutRef = useRef<number>();
  const [isPlaying, setIsPlaying] = useState(true);

  // Add state for X button
  const [isCloseButtonVisible, setIsCloseButtonVisible] = useState(true);
  const closeButtonTimeoutRef = useRef<number>();

  // Get the original scroll position when the component mounts
  const originalScrollPosition = useRef(
    sessionStorage.getItem("originalScrollPosition")
  );

  const currentPhotoIndex = cards.findIndex(
    (card) => card.id === Number(photoId)
  );

  // If the photo ID doesn't match any card, navigate back to the main page
  useEffect(() => {
    if (currentPhotoIndex === -1 && cards.length > 0) {
      console.error(
        `Photo with ID ${photoId} not found in ${cards.length} cards`
      );
      console.log(
        "Available card IDs:",
        cards.map((card) => card.id).join(", ")
      );
      navigate("/");
      return;
    }
  }, [currentPhotoIndex, photoId, navigate, cards]);

  // If we can't find the current photo, don't try to render anything
  if (currentPhotoIndex === -1) {
    return null;
  }

  const currentPhoto = cards[currentPhotoIndex];
  const prevPhoto =
    cards[currentPhotoIndex > 0 ? currentPhotoIndex - 1 : cards.length - 1];
  const nextPhoto =
    cards[currentPhotoIndex < cards.length - 1 ? currentPhotoIndex + 1 : 0];

  useEffect(() => {
    if (currentPhoto) {
      // Preload the current image or video
      if (currentPhoto.type === "video") {
        // For videos, we'll consider them loaded once the component renders
        setTimeout(() => setImageLoaded(true), 100);
      } else {
        const img = new Image();
        img.src = currentPhoto?.thumbnail;
        img.onload = () => {
          setImageLoaded(true);
        };
      }

      // Preload the next image
      if (nextPhoto && nextPhoto.type !== "video") {
        const nextImg = new Image();
        nextImg.src = nextPhoto?.thumbnail;
        nextImg.onload = () => {
          setNextImageLoaded(true);
        };
      } else if (nextPhoto) {
        // For videos, just mark as loaded
        setNextImageLoaded(true);
      }

      // Preload the previous image
      if (prevPhoto && prevPhoto.type !== "video") {
        const prevImg = new Image();
        prevImg.src = prevPhoto?.thumbnail;
        prevImg.onload = () => {
          setPrevImageLoaded(true);
        };
      } else if (prevPhoto) {
        // For videos, just mark as loaded
        setPrevImageLoaded(true);
      }

      // Show the component after a short delay
      setTimeout(() => {
        setIsVisible(true);
      }, 100);

      // Update the description collapsed state
      const hasDescription = !!(currentPhoto?.content as any)?.props?.media
        ?.description;
      setIsDescriptionCollapsed(!hasDescription);
    }
  }, [currentPhoto, nextPhoto, prevPhoto]);

  const handleClose = () => {
    console.log(
      "PhotoView: Restoring original scroll position:",
      originalScrollPosition.current
    );
    if (originalScrollPosition.current) {
      sessionStorage.setItem("scrollPosition", originalScrollPosition.current);
      sessionStorage.removeItem("originalScrollPosition");
    }
    navigate("/");
  };

  const showCounterTemporarily = useCallback(() => {
    setIsCounterVisible(true);
    if (counterTimeoutRef.current) {
      clearTimeout(counterTimeoutRef.current);
    }
    counterTimeoutRef.current = setTimeout(() => {
      setIsCounterVisible(false);
    }, 3000);
  }, []);

  useEffect(() => {
    // Show counter when photo changes
    showCounterTemporarily();
  }, [currentPhotoIndex, showCounterTemporarily]);

  useEffect(() => {
    // Cleanup timeout on unmount
    return () => {
      if (counterTimeoutRef.current) {
        clearTimeout(counterTimeoutRef.current);
      }
    };
  }, []);

  const navigateImage = useCallback(
    (direction: "prev" | "next") => {
      const newIndex =
        direction === "prev"
          ? currentPhotoIndex > 0
            ? currentPhotoIndex - 1
            : cards.length - 1
          : currentPhotoIndex < cards.length - 1
          ? currentPhotoIndex + 1
          : 0;

      const nextCard = cards[newIndex];
      if (nextCard) {
        setDragX(0);
        navigate(`/photo/${nextCard.id}`);
        const hasDescription = !!(nextCard?.content as any)?.props?.media
          ?.description;
        setIsDescriptionCollapsed(!hasDescription);
      }
    },
    [currentPhotoIndex, cards, navigate]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        navigateImage("prev");
      } else if (e.key === "ArrowRight") {
        navigateImage("next");
      } else if (e.key === "Escape") {
        handleClose();
      } else if (e.key === " ") {
        // Space bar to toggle video playback
        if (currentPhoto.type === "video") {
          toggleVideoPlayback();
        }
      }
    },
    [navigateImage, currentPhoto]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const toggleVideoPlayback = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current
          .play()
          .then(() => {
            setIsPlaying(true);
          })
          .catch((error) => {
            console.error("Error playing video:", error);
          });
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const restartVideo = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch(console.error);
    }
  }, []);

  const bindGesture = useGesture(
    {
      onDragStart: () => {
        setIsDragging(true);
      },
      onDrag: ({ movement: [x] }) => {
        // Only allow dragging if we're not zoomed in
        if (
          (imageRef.current &&
            imageRef.current.getBoundingClientRect().width <=
              window.innerWidth) ||
          (videoRef.current &&
            videoRef.current.getBoundingClientRect().width <= window.innerWidth)
        ) {
          const dampedX =
            x > 0
              ? Math.min(x * 0.8, windowWidth)
              : Math.max(x * 0.8, -windowWidth);
          setDragX(dampedX);
        }
      },
      onDragEnd: ({ movement: [x], velocity, active }) => {
        if (active) return; // Don't navigate if still dragging

        setIsDragging(false);

        if (
          (!imageRef.current ||
            imageRef.current.getBoundingClientRect().width <=
              window.innerWidth) &&
          (!videoRef.current ||
            videoRef.current.getBoundingClientRect().width <= window.innerWidth)
        ) {
          const swipeVelocityThreshold = 0.5;
          const shouldSwipe =
            Math.abs(x) >= swipeThreshold ||
            Math.abs(velocity) > swipeVelocityThreshold;

          if (shouldSwipe) {
            if (x > 0) {
              navigateImage("prev");
            } else {
              navigateImage("next");
            }
          }
        }

        setDragX(0);
      },
    },
    {
      drag: {
        filterTaps: true,
        threshold: 5,
        rubberband: true,
        axis: "x",
        bounds: { left: -windowWidth, right: windowWidth },
        swipeVelocity: 0.1,
      },
    }
  );

  // Add effect to reset preview image states when navigating
  useEffect(() => {
    setImageLoaded(false);
    setPrevImageLoaded(false);
    setNextImageLoaded(false);
    setIsPlaying(true);
  }, [currentPhotoIndex]);

  // Add video event listeners
  useEffect(() => {
    const videoElement = videoRef.current;

    const handleVideoEnded = () => {
      setIsPlaying(false);
    };

    if (videoElement) {
      videoElement.addEventListener("ended", handleVideoEnded);
    }

    return () => {
      if (videoElement) {
        videoElement.removeEventListener("ended", handleVideoEnded);
      }
    };
  }, [currentPhotoIndex]);

  // Add effect to set initial description collapsed state
  useEffect(() => {
    if (currentPhoto) {
      const hasDescription = !!(currentPhoto?.content as any)?.props?.media
        ?.description;
      setIsDescriptionCollapsed(!hasDescription);
    }
  }, [currentPhoto]);

  // Add an effect to handle the navigation end event
  useEffect(() => {
    // Set body overflow to hidden when component mounts
    document.body.style.overflow = "hidden";

    // Dispatch navigation end event when component mounts
    setTimeout(() => {
      window.dispatchEvent(new Event("navigationEnd"));
    }, 100);

    return () => {
      // Reset body overflow when component unmounts
      document.body.style.overflow = "";
    };
  }, []);

  // Function to hide close button after delay
  const hideCloseButtonAfterDelay = useCallback(() => {
    if (closeButtonTimeoutRef.current) {
      clearTimeout(closeButtonTimeoutRef.current);
    }
    closeButtonTimeoutRef.current = setTimeout(() => {
      setIsCloseButtonVisible(false);
    }, 3000); // Hide after 3 seconds
  }, []);

  // Function to show close button and start the hide timer
  const showCloseButton = useCallback(() => {
    // Always make the button visible
    setIsCloseButtonVisible(true);

    // Reset the timer
    hideCloseButtonAfterDelay();
  }, [hideCloseButtonAfterDelay]);

  // Initially hide close button after delay
  useEffect(() => {
    if (isVisible) {
      hideCloseButtonAfterDelay();
    }

    return () => {
      if (closeButtonTimeoutRef.current) {
        clearTimeout(closeButtonTimeoutRef.current);
      }
    };
  }, [isVisible, hideCloseButtonAfterDelay]);

  // Monitor for mouse movement to detect video controls visibility
  useEffect(() => {
    if (currentPhoto?.type === "video") {
      const handleMouseMove = (e: MouseEvent) => {
        // Get mouse Y position
        const mouseY = e.clientY;
        // Video container position
        const containerRect = videoRef.current?.getBoundingClientRect();

        if (containerRect) {
          // If mouse is in the top area of the video (where controls typically appear)
          const isInControlsArea = mouseY < containerRect.top + 60;

          if (isInControlsArea) {
            // Controls are likely visible
            setIsCloseButtonVisible(true);
          }

          // Clear any existing timeout
          if (closeButtonTimeoutRef.current) {
            clearTimeout(closeButtonTimeoutRef.current);
          }

          // Set timeout to mark controls as hidden after inactivity
          closeButtonTimeoutRef.current = setTimeout(() => {
            setIsCloseButtonVisible(false);
          }, 3000);
        }
      };

      // Add mouse movement listener
      window.addEventListener("mousemove", handleMouseMove);

      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        if (closeButtonTimeoutRef.current) {
          clearTimeout(closeButtonTimeoutRef.current);
        }
      };
    }
  }, [currentPhoto?.type]);

  // Renamed handleContainerClick to be more specific
  const handleImageContainerClick = useCallback(() => {
    // Show close button on click and restart the timer
    showCloseButton();
  }, [showCloseButton]);

  // Handle video container click
  const handleVideoAreaClick = (e: React.MouseEvent) => {
    // First, show the close button
    showCloseButton();

    // Then handle the video navigation
    // Calculate the position relative to the container width
    const container = e.currentTarget as HTMLElement;
    const containerWidth = container.offsetWidth;
    const clickX = e.nativeEvent.offsetX;
    const relativePosition = clickX / containerWidth;

    // Check if click is in the left or right third of the video area
    if (relativePosition < 0.2) {
      // Left 20% - navigate to previous
      navigateImage("prev");
    } else if (relativePosition > 0.8) {
      // Right 20% - navigate to next
      navigateImage("next");
    }
    // Middle area (60%) is reserved for video controls
  };

  if (!isVisible) {
    return (
      <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!currentPhoto) {
    navigate("/");
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[100] bg-black"
    >
      <div
        className="relative w-full h-full flex flex-col sm:flex-row"
        onClick={
          currentPhoto.type !== "video" ? handleImageContainerClick : undefined
        }
      >
        <div
          className={`${
            isDescriptionCollapsed ? "h-[90vh]" : "h-[60vh]"
          } sm:h-full flex-1 flex items-center justify-center transition-all duration-300 relative overflow-hidden`}
        >
          <div className="relative w-full h-full">
            {/* Only add the touch layer for swipe gestures if it's not a video */}
            {currentPhoto.type !== "video" && (
              <motion.div
                ref={touchLayerRef}
                className="absolute inset-0 z-10"
                style={{
                  touchAction: "pan-y pinch-zoom",
                }}
                {...bindGesture()}
              />
            )}

            {/* Add swipe areas for videos on the left and right sides, but not at the top */}
            {currentPhoto.type === "video" && (
              <>
                {/* Left swipe area - 20% width, excluding top area for controls */}
                <motion.div
                  className="absolute top-[60px] bottom-0 left-0 w-[20%] z-20"
                  style={{
                    touchAction: "pan-y",
                  }}
                  {...bindGesture()}
                />

                {/* Right swipe area - 20% width, excluding top area for controls */}
                <motion.div
                  className="absolute top-[60px] bottom-0 right-0 w-[20%] z-20"
                  style={{
                    touchAction: "pan-y",
                  }}
                  {...bindGesture()}
                />
              </>
            )}

            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              initial={false}
              animate={{
                x: dragX - windowWidth,
                opacity: Math.abs(dragX) / (windowWidth / 2),
                scale: 0.95 + (Math.abs(dragX) / windowWidth) * 0.05,
              }}
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 },
                scale: { duration: 0.2 },
              }}
              style={{
                zIndex: dragX > 0 ? 1 : 0,
                visibility: prevImageLoaded ? "visible" : "hidden",
              }}
            >
              {prevPhoto.type === "video" ? (
                <div className="video-container relative w-full h-full flex items-center justify-center">
                  <div
                    className="max-h-full w-auto object-contain"
                    style={{
                      maxHeight: "100%",
                      maxWidth: "100%",
                      backgroundImage: `url(${prevPhoto.thumbnail})`,
                      backgroundSize: "contain",
                      backgroundPosition: "center",
                      backgroundRepeat: "no-repeat",
                      width: "100%",
                      height: "100%",
                    }}
                  />
                </div>
              ) : (
                <motion.img
                  src={prevPhoto.thumbnail}
                  alt=""
                  className="max-h-full w-auto object-contain select-none"
                  draggable="false"
                  initial={false}
                  onLoad={() => setPrevImageLoaded(true)}
                  style={{
                    touchAction: "none",
                    userSelect: "none",
                    WebkitUserSelect: "none",
                    willChange: "transform",
                    maxHeight: "100%",
                    maxWidth: "100%",
                  }}
                />
              )}
            </motion.div>

            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              initial={false}
              animate={{
                x: dragX,
                scale: isDragging ? 0.98 : 1,
              }}
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                scale: { duration: 0.2 },
              }}
              style={{
                zIndex: 2,
                width: "100%",
                height: "100%",
                overflow: "hidden",
              }}
            >
              <div className="w-full h-full flex items-center justify-center relative">
                {!imageLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <div className="w-8 h-8 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin" />
                  </div>
                )}

                {currentPhoto.type === "video" ? (
                  <div
                    className="video-container relative w-full h-full flex items-center justify-center"
                    onClick={handleVideoAreaClick}
                    onDoubleClick={(e) => {
                      // Handle double click to toggle fullscreen
                      e.preventDefault();
                      if (videoRef.current) {
                        if (document.fullscreenElement) {
                          document.exitFullscreen();
                        } else {
                          videoRef.current.requestFullscreen();
                        }
                      }
                    }}
                  >
                    {/* Video element */}
                    <video
                      ref={videoRef}
                      className="max-h-full w-auto object-contain"
                      playsInline
                      preload="auto"
                      controls
                      style={{
                        maxHeight: "100%",
                        maxWidth: "100%",
                        zIndex: 40, // Ensure controls are accessible
                        position: "relative", // Add this to ensure z-index works properly
                      }}
                      onLoadedMetadata={() => setImageLoaded(true)}
                      onClick={(e) => {
                        // Allow clicks on the video element for controls
                        e.stopPropagation();
                        // Show the close button
                        showCloseButton();
                        // Since we clicked the video, controls will be visible
                        setIsCloseButtonVisible(true);
                      }}
                      onTouchStart={(e) => {
                        // Only stop propagation if not in the top control area
                        const touchY = e.touches[0].clientY;
                        const videoRect =
                          videoRef.current?.getBoundingClientRect();

                        if (videoRect) {
                          // If touch is in the top area (where controls appear)
                          const isInTopControlArea =
                            touchY < videoRect.top + 60;

                          // Only stop propagation if NOT in the top control area
                          if (!isInTopControlArea) {
                            // Handle touch events to allow native controls to work in middle area
                            const touchX = e.touches[0].clientX;
                            const screenWidth = window.innerWidth;
                            const relativePosition = touchX / screenWidth;

                            // If touch is in the middle 60% of the screen, let video controls handle it
                            if (
                              relativePosition >= 0.2 &&
                              relativePosition <= 0.8
                            ) {
                              e.stopPropagation();
                            }
                          }
                        }
                      }}
                      src={config.getImageUrl(
                        (currentPhoto?.content as any)?.props?.media?.url
                      )}
                      poster={currentPhoto.thumbnail}
                    >
                      Your browser does not support the video tag.
                    </video>

                    {/* Play/Pause/Replay button overlay - only shown when paused or ended */}
                    <div
                      className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none transition-opacity duration-200"
                      style={{
                        opacity:
                          !isPlaying ||
                          (videoRef.current && videoRef.current.ended)
                            ? 1
                            : 0,
                      }}
                    >
                      <button
                        className="bg-black/40 backdrop-blur-sm rounded-full p-4 transition-all duration-200 hover:bg-black/60 pointer-events-auto"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (videoRef.current && videoRef.current.ended) {
                            restartVideo();
                          } else {
                            toggleVideoPlayback();
                          }
                        }}
                      >
                        {videoRef.current && videoRef.current.ended ? (
                          // Replay icon
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="48"
                            height="48"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="white"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                            <path d="M3 3v5h5" />
                          </svg>
                        ) : (
                          // Play icon
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="48"
                            height="48"
                            viewBox="0 0 24 24"
                            fill="white"
                          >
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  <motion.img
                    ref={imageRef}
                    src={currentPhoto.thumbnail}
                    alt=""
                    className="max-h-full w-auto object-contain select-none"
                    draggable="false"
                    initial={false}
                    onLoad={() => setImageLoaded(true)}
                    style={{
                      touchAction: "none",
                      userSelect: "none",
                      WebkitUserSelect: "none",
                      willChange: "transform",
                      maxHeight: "100%",
                      maxWidth: "100%",
                    }}
                    {...bindGesture()}
                  />
                )}
              </div>
            </motion.div>

            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              initial={false}
              animate={{
                x: dragX + windowWidth,
                opacity: Math.abs(dragX) / (windowWidth / 2),
                scale: 0.95 + (Math.abs(dragX) / windowWidth) * 0.05,
              }}
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 },
                scale: { duration: 0.2 },
              }}
              style={{
                zIndex: dragX < 0 ? 1 : 0,
                visibility: nextImageLoaded ? "visible" : "hidden",
              }}
            >
              {nextPhoto.type === "video" ? (
                <div className="video-container relative w-full h-full flex items-center justify-center">
                  <div
                    className="max-h-full w-auto object-contain"
                    style={{
                      maxHeight: "100%",
                      maxWidth: "100%",
                      backgroundImage: `url(${nextPhoto.thumbnail})`,
                      backgroundSize: "contain",
                      backgroundPosition: "center",
                      backgroundRepeat: "no-repeat",
                      width: "100%",
                      height: "100%",
                    }}
                  />
                </div>
              ) : (
                <motion.img
                  src={nextPhoto.thumbnail}
                  alt=""
                  className="max-h-full w-auto object-contain select-none"
                  draggable="false"
                  initial={false}
                  onLoad={() => setNextImageLoaded(true)}
                  style={{
                    touchAction: "none",
                    userSelect: "none",
                    WebkitUserSelect: "none",
                    willChange: "transform",
                    maxHeight: "100%",
                    maxWidth: "100%",
                  }}
                />
              )}
            </motion.div>

            {/* Redesigned Close Button with improved contrast and position */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleClose();
              }}
              className={`absolute top-10 left-8 z-50 rounded-full bg-black hover:bg-gray-800 border border-white text-white w-9 h-9 flex items-center justify-center transition-all duration-300 ${
                isCloseButtonVisible
                  ? "opacity-100"
                  : "opacity-0 pointer-events-none"
              }`}
              aria-label="Close"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-4 h-4"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          {/* Image Counter */}
          <div
            className={`absolute bottom-4 left-1/2 -translate-x-1/2 z-30 bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-full text-white/90 text-sm font-medium transition-opacity duration-300 ${
              isCounterVisible ? "opacity-100" : "opacity-0"
            }`}
          >
            {currentPhotoIndex + 1} / {cards.length}
          </div>

          <button
            onClick={() => navigateImage("prev")}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 text-white/60 hover:text-white transition-colors duration-200 z-30"
            aria-label="Previous image"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 19.5L8.25 12l7.5-7.5"
              />
            </svg>
          </button>
          <button
            onClick={() => navigateImage("next")}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-white/60 hover:text-white transition-colors duration-200 z-30"
            aria-label="Next image"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.25 4.5l7.5 7.5-7.5 7.5"
              />
            </svg>
          </button>
        </div>

        <div
          className={`w-full sm:w-80 backdrop-blur-sm transition-all duration-300 sm:h-full
          ${isDescriptionCollapsed ? "h-[10vh]" : "h-[40vh]"}
          overflow-y-auto relative`}
        >
          {React.cloneElement(currentPhoto.content as React.ReactElement, {
            onExpand: handleClose,
            isExpanded: true,
            isCompact: false,
            isCollapsed: isDescriptionCollapsed,
            onToggleCollapse: () =>
              setIsDescriptionCollapsed(!isDescriptionCollapsed),
          })}
        </div>
      </div>
    </motion.div>
  );
};

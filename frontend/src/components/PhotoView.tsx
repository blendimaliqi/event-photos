import React, { useState, useCallback, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, PanInfo } from "framer-motion";

interface PhotoViewProps {
  cards: {
    id: number;
    content: React.ReactElement;
    className: string;
    thumbnail: string;
  }[];
}

export const PhotoView: React.FC<PhotoViewProps> = ({ cards }) => {
  const navigate = useNavigate();
  const { photoId } = useParams();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isDescriptionCollapsed, setIsDescriptionCollapsed] = useState(false);
  const [dragX, setDragX] = useState(0);
  const touchLayerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null); // Ref to the image
  const swipeThreshold = 100;
  const windowWidth = typeof window !== "undefined" ? window.innerWidth : 0;
  const [isPinching, setIsPinching] = useState(false); // Track pinch zoom state

  const currentPhotoIndex = cards.findIndex(
    (card) => card.id === Number(photoId)
  );
  const currentPhoto = cards[currentPhotoIndex];
  const prevPhoto =
    cards[currentPhotoIndex > 0 ? currentPhotoIndex - 1 : cards.length - 1];
  const nextPhoto =
    cards[currentPhotoIndex < cards.length - 1 ? currentPhotoIndex + 1 : 0];

  const handleClose = () => {
    navigate("/");
  };

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
        const hasDescription = !!(nextCard?.content as any)?.props?.photo
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
      }
    },
    [navigateImage]
  );

  React.useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Touch event handlers with pinch zoom detection
  React.useEffect(() => {
    const touchLayer = touchLayerRef.current;
    if (!touchLayer) return;

    const handleTouchStart = (e: TouchEvent) => {
      const touchCount = e.touches.length;

      if (touchCount === 2) {
        setIsPinching(true); // Pinch zoom detected
        touchLayer.style.pointerEvents = "none"; //Disable Swipe
        setDragX(0);
      } else {
        setIsPinching(false);
        touchLayer.style.pointerEvents = "auto"; //Enable Swipe
      }

      touchLayer.setAttribute("data-touch-count", touchCount.toString());
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const touchCount = e.touches.length;

      if (isPinching && touchCount < 2) {
        setIsPinching(false);
        // Small delay to ensure zoom ends cleanly before re-enabling swipe
        setTimeout(() => {
          if (touchLayer) {
            touchLayer.style.pointerEvents = "auto";
          }
        }, 100);
      }

      touchLayer.setAttribute("data-touch-count", touchCount.toString());
    };

    const handleTouchCancel = () => {
      setIsPinching(false);
      touchLayer.setAttribute("data-touch-count", "0");
      setTimeout(() => {
        if (touchLayer) {
          touchLayer.style.pointerEvents = "auto";
        }
      }, 100);
    };

    touchLayer.addEventListener("touchstart", handleTouchStart);
    touchLayer.addEventListener("touchend", handleTouchEnd);
    touchLayer.addEventListener("touchcancel", handleTouchCancel);

    return () => {
      touchLayer.removeEventListener("touchstart", handleTouchStart);
      touchLayer.removeEventListener("touchend", handleTouchEnd);
      touchLayer.removeEventListener("touchcancel", handleTouchCancel);
    };
  }, [setDragX, isPinching]);

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (isPinching) return; // Do nothing if pinching

    const { offset } = info;
    const touchCount = Number(
      touchLayerRef.current?.getAttribute("data-touch-count") || "0"
    );

    // Only handle swipe if we have 0 or 1 touch points
    if (touchCount <= 1 && Math.abs(offset.x) > swipeThreshold) {
      if (offset.x > 0) {
        navigateImage("prev");
      } else {
        navigateImage("next");
      }
    }
    setDragX(0);
  };

  if (!currentPhoto) {
    navigate("/");
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black"
    >
      <div className="relative w-full h-full flex flex-col sm:flex-row">
        <div
          className={`${
            isDescriptionCollapsed ? "h-[90vh]" : "h-[60vh]"
          } sm:h-full flex-1 flex items-center justify-center transition-all duration-300 relative overflow-hidden`}
        >
          <div className="relative w-full h-full">
            {/* Touch layer for swipe only */}
            <motion.div
              ref={touchLayerRef}
              className="absolute inset-0 z-10 touch-none"
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.1}
              onDragEnd={handleDragEnd}
              dragListener={!isPinching} // Disable drag when pinching
              onDrag={(_, info) => {
                const touchCount = parseInt(
                  touchLayerRef.current?.getAttribute("data-touch-count") || "0"
                );
                if (touchCount === 1 && !isPinching) {
                  setDragX(info.offset.x);
                } else {
                  setDragX(0);
                }
              }}
            />

            {/* Previous Image */}
            <motion.div
              className="absolute inset-y-0 flex items-center justify-end touch-none"
              style={{
                left: -windowWidth,
                width: windowWidth,
                x: dragX > 0 ? dragX : 0,
              }}
            >
              <img
                src={prevPhoto.thumbnail}
                alt=""
                className="max-h-full w-auto object-contain select-none"
                draggable="false"
                style={{
                  touchAction: "manipulation",
                  userSelect: "none",
                  WebkitUserSelect: "none",
                }}
              />
            </motion.div>

            {/* Current Image */}
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              style={{ x: dragX }}
            >
              <div className="w-full h-full flex items-center justify-center">
                {!imageLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <div className="w-8 h-8 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin" />
                  </div>
                )}
                <motion.img
                  key={currentPhoto.id}
                  src={currentPhoto.thumbnail}
                  alt=""
                  className="max-h-full w-auto object-contain select-none"
                  draggable="false"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: imageLoaded ? 1 : 0 }}
                  transition={{ duration: 0.3 }}
                  onLoad={() => setImageLoaded(true)}
                  ref={imageRef} // Attach the ref
                  style={{
                    touchAction: "pinch-zoom",
                    userSelect: "none",
                    WebkitUserSelect: "none",
                    maxWidth: "100%",
                    maxHeight: "100%",
                    width: "auto",
                    height: "auto",
                  }}
                />
              </div>
            </motion.div>

            {/* Next Image */}
            <motion.div
              className="absolute inset-y-0 flex items-center justify-start touch-none"
              style={{
                right: -windowWidth,
                width: windowWidth,
                x: dragX < 0 ? dragX : 0,
              }}
            >
              <img
                src={nextPhoto.thumbnail}
                alt=""
                className="max-h-full w-auto object-contain select-none"
                draggable="false"
                style={{
                  touchAction: "manipulation",
                  userSelect: "none",
                  WebkitUserSelect: "none",
                }}
              />
            </motion.div>
          </div>

          {/* Navigation Buttons */}
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

          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 z-20 p-2 rounded-full bg-rose-100/80 hover:bg-rose-200/90 text-rose-800/90 hover:text-rose-900 transition-all duration-200"
          >
            <svg
              className="w-3 h-3"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M18 6L6 18"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M6 6L18 18"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        {/* Description Panel */}
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

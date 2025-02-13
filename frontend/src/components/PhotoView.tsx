import React, { useState, useCallback, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useGesture } from "react-use-gesture";

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
  const imageRef = useRef<HTMLImageElement>(null);
  const swipeThreshold = 100;
  const windowWidth = typeof window !== "undefined" ? window.innerWidth : 0;
  const [prevImageLoaded, setPrevImageLoaded] = useState(false);
  const [nextImageLoaded, setNextImageLoaded] = useState(false);

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

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const bindGesture = useGesture(
    {
      onDrag: ({ movement: [x] }) => {
        // Allow horizontal dragging
        setDragX(x);
      },
      onDragEnd: ({ movement: [x, y], velocity }) => {
        const shouldSwipe =
          Math.abs(x) >= swipeThreshold || Math.abs(velocity) > 0.5;
        if (shouldSwipe && Math.abs(x) > Math.abs(y)) {
          if (x > 0) {
            navigateImage("prev");
          } else {
            navigateImage("next");
          }
        }
        setDragX(0);
      },
    },
    {
      drag: {
        rubberband: true,
      },
    }
  );

  // Add effect to reset preview image states when navigating
  useEffect(() => {
    setPrevImageLoaded(false);
    setNextImageLoaded(false);
  }, [currentPhotoIndex]);

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
            <motion.div
              ref={touchLayerRef}
              className="absolute inset-0 z-10"
              {...bindGesture()}
            />

            <motion.div
              className="absolute inset-0 flex items-center justify-center touch-none"
              initial={false}
              style={{
                x: dragX - windowWidth,
                opacity: Math.abs(dragX) / (windowWidth / 2),
                zIndex: dragX > 0 ? 1 : 0,
                pointerEvents: "none",
                visibility: prevImageLoaded ? "visible" : "hidden",
              }}
            >
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
                }}
              />
            </motion.div>

            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              initial={false}
              style={{
                x: dragX,
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
                <motion.img
                  key={currentPhoto.id}
                  src={currentPhoto.thumbnail}
                  alt=""
                  className="max-h-full w-auto object-contain select-none"
                  draggable="false"
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: imageLoaded ? 1 : 0,
                  }}
                  transition={{
                    duration: 0.2,
                  }}
                  onLoad={() => setImageLoaded(true)}
                  ref={imageRef}
                  style={{
                    touchAction: "none",
                    userSelect: "none",
                    WebkitUserSelect: "none",
                    maxWidth: "100%",
                    maxHeight: "100%",
                    width: "auto",
                    height: "auto",
                    willChange: "transform",
                  }}
                />
              </div>
            </motion.div>

            <motion.div
              className="absolute inset-0 flex items-center justify-center touch-none"
              initial={false}
              style={{
                x: dragX + windowWidth,
                opacity: Math.abs(dragX) / (windowWidth / 2),
                zIndex: dragX < 0 ? 1 : 0,
                pointerEvents: "none",
                visibility: nextImageLoaded ? "visible" : "hidden",
              }}
            >
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
                }}
              />
            </motion.div>
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

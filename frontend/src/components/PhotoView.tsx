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
  const [isPinching, setIsPinching] = useState(false);
  const [scale, setScale] = useState(1);
  const [origin, setOrigin] = useState([0, 0]);
  const [pan, setPan] = useState<[number, number]>([0, 0]);
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
        setScale(1);
        setOrigin([0, 0]);
        setPan([0, 0]);
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

  const resetImageState = useCallback(() => {
    setScale(1);
    setOrigin([0, 0]);
    setPan([0, 0]);
    setDragX(0);
    setIsPinching(false);
  }, []);

  const bindGesture = useGesture(
    {
      onPinch: ({ event, offset: [s], delta: [d], memo }) => {
        if (event?.cancelable) {
          event.preventDefault();
        }

        // Prevent pinch if we're in the middle of a swipe
        if (Math.abs(dragX) > 20) {
          return;
        }

        // Only start pinching if there's actual pinch movement
        if (Math.abs(d) < 0.001 && !isPinching) {
          return;
        }

        setIsPinching(true);
        const newScale = Math.min(3, Math.max(0.8, s));
        console.log("Pinch in progress, scale:", newScale, "delta:", d);

        // Only update origin on initial pinch and ensure it's centered between touch points
        if (!memo && imageRef.current) {
          const rect = imageRef.current.getBoundingClientRect();
          if (event instanceof TouchEvent && event.touches.length >= 2) {
            const touch1 = event.touches[0];
            const touch2 = event.touches[1];
            const centerX = (touch1.clientX + touch2.clientX) / 2;
            const centerY = (touch1.clientY + touch2.clientY) / 2;
            setOrigin([centerX - rect.left, centerY - rect.top]);
            memo = [centerX - rect.left, centerY - rect.top];
          }
        }

        setScale(newScale);
        return memo;
      },
      onPinchEnd: ({ offset: [s] }) => {
        setIsPinching(false);
        const finalScale = Math.min(3, Math.max(0.8, s));
        console.log("Pinch ended, final scale:", finalScale);
        // If final scale is close to or below 1, reset to initial state
        if (finalScale <= 1.1) {
          resetImageState();
        }
      },
      onDrag: ({ movement: [x, y], cancel }) => {
        // Prevent drag if we're pinching
        if (isPinching) {
          cancel();
          return;
        }

        if (scale > 1) {
          if (imageRef.current && imageRef.current.parentElement) {
            const containerRect =
              imageRef.current.parentElement.getBoundingClientRect();
            const imgRect = imageRef.current.getBoundingClientRect();
            const extraX = Math.max(
              0,
              (imgRect.width - containerRect.width) / 2
            );
            const extraY = Math.max(
              0,
              (imgRect.height - containerRect.height) / 2
            );
            const clampedX = Math.max(-extraX, Math.min(x, extraX));
            const clampedY = Math.max(-extraY, Math.min(y, extraY));
            setPan([clampedX, clampedY]);
          }
        } else {
          setDragX(x);
        }
      },
      onDragEnd: (state) => {
        if (isPinching) return;

        if (scale === 1) {
          const [x, y] = state.movement;
          const shouldSwipe =
            Math.abs(x) >= swipeThreshold || Math.abs(state.velocity) > 0.5;
          if (shouldSwipe && Math.abs(x) > Math.abs(y)) {
            if (x > 0) {
              navigateImage("prev");
            } else {
              navigateImage("next");
            }
          }
          setDragX(0);
        }
      },
    },
    {
      drag: {
        rubberband: true,
        initial: () => pan,
      },
      pinch: {
        distanceBounds: { min: 50 },
        rubberband: true,
      },
    }
  );

  useEffect(() => {
    resetImageState();
  }, [currentPhotoIndex, resetImageState]);

  // Add cleanup on component unmount
  useEffect(() => {
    return () => {
      resetImageState();
    };
  }, [resetImageState]);

  // Add effect to reset preview image states when navigating
  useEffect(() => {
    setPrevImageLoaded(false);
    setNextImageLoaded(false);
  }, [currentPhotoIndex]);

  useEffect(() => {
    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      const delta = event.deltaY;
      const newScale = Math.min(3, Math.max(0.5, scale - delta * 0.01));

      // Calculate new origin based on mouse position
      if (imageRef.current) {
        const rect = imageRef.current.getBoundingClientRect();
        const ox = event.clientX - rect.left;
        const oy = event.clientY - rect.top;
        setOrigin([ox, oy]);
      }

      setScale(newScale);
      console.log("Mouse wheel zoom, scale:", newScale);
      if (newScale <= 1.05) {
        resetImageState();
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => window.removeEventListener("wheel", handleWheel);
  }, [scale, resetImageState]);

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
      style={{ touchAction: "none" }}
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
              className="absolute inset-0 z-10 touch-none"
              style={{ userSelect: "none" }}
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
                    scale: scale,
                    x: scale > 1 ? pan[0] : 0,
                    y: scale > 1 ? pan[1] : 0,
                  }}
                  transition={{
                    duration: 0.2,
                    scale: {
                      type: "spring",
                      stiffness: 300,
                      damping: 30,
                    },
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
                    transformOrigin:
                      scale !== 1 ? `${origin[0]}px ${origin[1]}px` : "50% 50%",
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

import React, { useState, useCallback, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, PanInfo } from "framer-motion";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

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
  const [currentScale, setCurrentScale] = useState(1);
  const [isDescriptionCollapsed, setIsDescriptionCollapsed] = useState(false);
  const [transformApi, setTransformApi] = useState<any>(null);
  const [dragX, setDragX] = useState(0);
  const touchLayerRef = useRef<HTMLDivElement>(null);
  const swipeThreshold = 100; // minimum distance to trigger navigation

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

  const handleZoom = useCallback(
    (clientX: number, clientY: number, element: HTMLElement) => {
      if (transformApi) {
        const rect = element.getBoundingClientRect();
        const x = (clientX - rect.left) / rect.width;
        const y = (clientY - rect.top) / rect.height;

        if (currentScale > 1) {
          transformApi.resetTransform();
        } else {
          transformApi.zoomToPoint(2, {
            x: x * rect.width,
            y: y * rect.height,
          });
        }
      }
    },
    [currentScale, transformApi]
  );

  const handleDoubleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      e.preventDefault();
      handleZoom(e.clientX, e.clientY, e.target as HTMLElement);
    },
    [handleZoom]
  );

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (currentScale <= 1) {
      const { offset } = info;
      if (Math.abs(offset.x) > swipeThreshold) {
        if (offset.x > 0) {
          navigateImage("prev");
        } else {
          navigateImage("next");
        }
      }
      setDragX(0);
    }
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
          <TransformWrapper
            initialScale={1}
            minScale={0.5}
            maxScale={4}
            centerOnInit={true}
            alignmentAnimation={{ sizeX: 0, sizeY: 0 }}
            limitToBounds={true}
            doubleClick={{ mode: "reset" }}
            wheel={{ step: 0.2 }}
            panning={{
              velocityDisabled: true,
              excluded: ["button"],
              disabled: currentScale <= 1,
              activationKeys: ["Control"],
              lockAxisX: false,
              lockAxisY: false,
            }}
            pinch={{ disabled: false }}
            centerZoomedOut={true}
            onTransformed={(e) => {
              setCurrentScale(e.state.scale);
            }}
            onInit={(instance) => {
              setTransformApi(instance);
            }}
          >
            {() => (
              <>
                <motion.div
                  ref={touchLayerRef}
                  className="absolute inset-0 z-10"
                  drag={currentScale <= 1 ? "x" : false}
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.1}
                  onDragEnd={handleDragEnd}
                  onDrag={(_, info) => {
                    if (currentScale <= 1) {
                      setDragX(info.offset.x);
                    }
                  }}
                  onDoubleClick={handleDoubleClick}
                />
                <div className="relative w-full h-full">
                  {/* Previous Image */}
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center"
                    style={{
                      opacity: dragX > 0 ? dragX / (swipeThreshold * 2) : 0,
                      pointerEvents: "none",
                    }}
                  >
                    <img
                      src={prevPhoto.thumbnail}
                      alt=""
                      className="max-h-full w-auto object-contain select-none opacity-50"
                      draggable="false"
                    />
                  </motion.div>

                  {/* Current Image */}
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center"
                    style={{ x: dragX }}
                  >
                    <TransformComponent
                      wrapperClass="w-full h-full"
                      contentClass="w-full h-full flex items-center justify-center"
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
                          style={{
                            touchAction: "none",
                            userSelect: "none",
                            WebkitUserSelect: "none",
                            maxWidth: "100%",
                            maxHeight: "100%",
                            width: "auto",
                            height: "auto",
                          }}
                        />
                      </div>
                    </TransformComponent>
                  </motion.div>

                  {/* Next Image */}
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center"
                    style={{
                      opacity:
                        dragX < 0 ? Math.abs(dragX) / (swipeThreshold * 2) : 0,
                      pointerEvents: "none",
                    }}
                  >
                    <img
                      src={nextPhoto.thumbnail}
                      alt=""
                      className="max-h-full w-auto object-contain select-none opacity-50"
                      draggable="false"
                    />
                  </motion.div>
                </div>
              </>
            )}
          </TransformWrapper>

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

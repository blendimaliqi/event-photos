"use client";
import React, { useRef, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SortOption } from "../../hooks/usePhotos";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

type Card = {
  id: number;
  content: React.ReactNode;
  className: string;
  thumbnail: string;
};

type ViewMode = "masonry" | "grid" | "compact";

interface LayoutGridProps {
  cards: Card[];
  onSortChange: (sortBy: SortOption) => void;
  sortBy: SortOption;
}

export const LayoutGrid = ({
  cards,
  onSortChange,
  sortBy,
}: LayoutGridProps) => {
  const [selected, setSelected] = useState<number | null>(null);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const savedViewMode = localStorage.getItem("viewMode") as ViewMode;
    if (savedViewMode) return savedViewMode;
    return window.innerWidth < 640 ? "grid" : "masonry";
  });
  const [isDescriptionCollapsed, setIsDescriptionCollapsed] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: "newest", label: "Më të rejat" },
    { value: "oldest", label: "Më të vjetrat" },
    { value: "withDescription", label: "Me përshkrim" },
  ];

  useEffect(() => {
    const handleResize = () => {
      // Only update view mode if there's no saved preference
      if (!localStorage.getItem("viewMode")) {
        setViewMode(window.innerWidth < 640 ? "grid" : "masonry");
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleClick = (id: number) => {
    setSelected(id === selected ? null : id);
  };

  const handleExpand = (id: number) => {
    setExpanded(id);
    const expandedCard = cards.find((c) => c.id === id);
    const hasDescription = !!(expandedCard?.content as any)?.props?.photo
      ?.description;
    setIsDescriptionCollapsed(!hasDescription);
    document.body.style.overflow = "hidden";
  };

  const handleCloseExpanded = () => {
    setExpanded(null);
    setIsDescriptionCollapsed(false);
    document.body.style.overflow = "auto";
  };

  const navigateImage = useCallback(
    (direction: "prev" | "next") => {
      if (expanded === null) return;

      const currentIndex = cards.findIndex((card) => card.id === expanded);
      let newIndex;

      if (direction === "prev") {
        newIndex = currentIndex > 0 ? currentIndex - 1 : cards.length - 1;
      } else {
        newIndex = currentIndex < cards.length - 1 ? currentIndex + 1 : 0;
      }

      const nextCard = cards[newIndex];
      if (nextCard) {
        setExpanded(nextCard.id);
        const hasDescription = !!(nextCard?.content as any)?.props?.photo
          ?.description;
        setIsDescriptionCollapsed(!hasDescription);
      }
    },
    [expanded, cards]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (expanded !== null) {
        if (e.key === "ArrowLeft") {
          navigateImage("prev");
        } else if (e.key === "ArrowRight") {
          navigateImage("next");
        } else if (e.key === "Escape") {
          handleCloseExpanded();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [expanded, navigateImage, handleCloseExpanded]);

  const toggleViewMode = () => {
    const newViewMode =
      viewMode === "masonry"
        ? "grid"
        : viewMode === "grid"
        ? "compact"
        : "masonry";
    setViewMode(newViewMode);
    localStorage.setItem("viewMode", newViewMode);
  };

  const containerClassName =
    viewMode === "masonry"
      ? "columns-1 sm:columns-2 lg:columns-3 xl:columns-4 2xl:columns-4 gap-4 px-4 sm:px-0"
      : viewMode === "grid"
      ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 px-4 sm:px-0"
      : "grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-10 gap-4 px-4 sm:px-0";

  return (
    <div className="space-y-4">
      <div className="flex justify-end px-4 sm:px-0 gap-2">
        <button
          onClick={toggleViewMode}
          className="inline-flex items-center gap-2 px-3 py-1.5 bg-rose-100 text-rose-800 rounded-full text-sm font-medium hover:bg-rose-200 transition-colors"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16m-7 6h7"
            />
          </svg>
          {viewMode === "masonry"
            ? "Pamja Grid"
            : viewMode === "grid"
            ? "Pamja Kompakte"
            : "Pamja Masonry"}
        </button>
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value as SortOption)}
          className="inline-flex items-center gap-2 px-3 py-1.5 bg-rose-100 text-rose-800 rounded-full text-sm font-medium hover:bg-rose-200 transition-colors appearance-none pr-8 cursor-pointer border-none focus:ring-0 focus:outline-none"
          style={{
            backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23991B1B' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 8px center",
            backgroundSize: "16px",
          }}
        >
          {sortOptions.map((option) => (
            <option
              key={option.value}
              value={option.value}
              className="text-gray-900"
            >
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <div ref={containerRef} className={containerClassName}>
        {cards.map((card) => (
          <div
            key={card.id}
            className={viewMode === "masonry" ? "break-inside-avoid mb-6" : ""}
          >
            <div
              onClick={() => handleClick(card.id)}
              className={`relative overflow-hidden rounded-3xl cursor-pointer shadow-xl group ${
                viewMode === "compact" ? "rounded-lg" : "rounded-3xl"
              }`}
            >
              <img
                src={card.thumbnail}
                alt=""
                className={`w-full object-cover ${
                  viewMode === "masonry"
                    ? "aspect-square"
                    : viewMode === "grid"
                    ? "aspect-[3/4]"
                    : "aspect-[1/1]"
                }`}
              />
              {(card.content as any)?.props?.photo?.description && (
                <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-full text-white text-xs font-medium flex items-center gap-1 z-10">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-3 h-3"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12"
                    />
                  </svg>
                </div>
              )}
              <div
                className={`absolute inset-0 bg-gradient-to-b from-transparent to-black/50 transition-opacity duration-300 ${
                  selected === card.id
                    ? "opacity-100"
                    : "opacity-0 group-hover:opacity-100"
                }`}
              />
              <AnimatePresence>
                {selected === card.id && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.2 }}
                    className={`absolute inset-0 flex items-end ${
                      viewMode === "compact" ? "p-2" : "p-6"
                    }`}
                  >
                    <div
                      className="w-full"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {React.cloneElement(card.content as React.ReactElement, {
                        onExpand: () => handleExpand(card.id),
                        isExpanded: false,
                        isCompact: viewMode === "compact",
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {expanded !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 bg-black/80 backdrop-blur-sm"
            onClick={handleCloseExpanded}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full h-full max-w-5xl max-h-[90vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={handleCloseExpanded}
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
              <div className="relative w-full h-full flex items-center justify-center bg-black">
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
                        lockAxisY: true,
                        velocityDisabled: true,
                        excluded: ["button"],
                      }}
                      onPanningStart={({ state }) => {
                        // Only enable panning for navigation when not zoomed
                        if (state.scale > 1.01) {
                          return;
                        }
                      }}
                      onPanning={({ state }) => {
                        // Only handle swipes when not zoomed
                        if (state.scale <= 1.01) {
                          const offset = state.positionX;
                          if (Math.abs(offset) > 50) {
                            const targetElement =
                              document.getElementById("image");
                            if (targetElement) {
                              targetElement.style.opacity = Math.max(
                                0.5,
                                1 - Math.abs(offset) / 200
                              ).toString();
                            }
                          }
                        }
                      }}
                      onPanningStop={({ state }) => {
                        const targetElement = document.getElementById("image");
                        if (targetElement) {
                          targetElement.style.opacity = "1";
                        }

                        if (state.scale <= 1.01) {
                          const offset = state.positionX;
                          if (Math.abs(offset) > 100) {
                            if (offset > 0) {
                              navigateImage("prev");
                            } else {
                              navigateImage("next");
                            }
                          }
                        }
                      }}
                    >
                      {({ zoomIn, zoomOut, resetTransform }) => (
                        <>
                          <TransformComponent
                            wrapperClass="w-full h-full"
                            contentClass="w-full h-full flex items-center justify-center"
                          >
                            <img
                              id="image"
                              src={
                                cards.find((c) => c.id === expanded)?.thumbnail
                              }
                              alt=""
                              className="max-w-full max-h-full object-contain select-none transition-opacity duration-200"
                              draggable="false"
                            />
                          </TransformComponent>

                          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-30">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                zoomOut();
                              }}
                              className="p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                            >
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
                                  d="M19.5 12h-15"
                                />
                              </svg>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                resetTransform();
                              }}
                              className="p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                            >
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
                                  d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25"
                                />
                              </svg>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                zoomIn();
                              }}
                              className="p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                            >
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
                                  d="M12 4.5v15m7.5-7.5h-15"
                                />
                              </svg>
                            </button>
                          </div>
                        </>
                      )}
                    </TransformWrapper>

                    {/* Navigation Buttons */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigateImage("prev");
                      }}
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
                      onClick={(e) => {
                        e.stopPropagation();
                        navigateImage("next");
                      }}
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
                  {expanded !== null && (
                    <div
                      className={`w-full sm:w-80 backdrop-blur-sm transition-all duration-300 sm:h-full
                      ${isDescriptionCollapsed ? "h-[10vh]" : "h-[40vh]"} 
                      overflow-y-auto relative`}
                    >
                      {React.cloneElement(
                        cards.find((c) => c.id === expanded)
                          ?.content as React.ReactElement,
                        {
                          onExpand: handleCloseExpanded,
                          isExpanded: true,
                          isCompact: false,
                          isCollapsed: isDescriptionCollapsed,
                          onToggleCollapse: () =>
                            setIsDescriptionCollapsed(!isDescriptionCollapsed),
                        }
                      )}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

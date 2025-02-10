"use client";
import React, { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Card = {
  id: number;
  content: React.ReactNode;
  className: string;
  thumbnail: string;
};

type ViewMode = "masonry" | "grid" | "compact";

export const LayoutGrid = ({ cards }: { cards: Card[] }) => {
  const [selected, setSelected] = useState<number | null>(null);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("masonry");
  const containerRef = useRef<HTMLDivElement>(null);

  const handleClick = (id: number) => {
    setSelected(id === selected ? null : id);
  };

  const handleExpand = (id: number) => {
    setExpanded(id);
  };

  const handleCloseExpanded = () => {
    setExpanded(null);
  };

  const toggleViewMode = () => {
    if (viewMode === "masonry") setViewMode("grid");
    else if (viewMode === "grid") setViewMode("compact");
    else setViewMode("masonry");
  };

  const containerClassName =
    viewMode === "masonry"
      ? "columns-1 sm:columns-2 lg:columns-3 xl:columns-4 2xl:columns-4 gap-4 px-4 sm:px-0"
      : viewMode === "grid"
      ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 px-4 sm:px-0"
      : "grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-10 gap-4 px-4 sm:px-0";

  return (
    <div className="space-y-4">
      <div className="flex justify-end px-4 sm:px-0">
        <button
          onClick={toggleViewMode}
          className="inline-flex items-center px-3 py-1.5 bg-rose-100 text-rose-800 rounded-full text-sm font-medium hover:bg-rose-200 transition-colors"
        >
          {viewMode === "masonry" ? (
            <>
              <svg
                className="w-4 h-4 mr-1.5"
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
              Grid View
            </>
          ) : viewMode === "grid" ? (
            <>
              <svg
                className="w-4 h-4 mr-1.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4h4v4H4V4zm6 0h4v4h-4V4zm6 0h4v4h-4V4zm-12 6h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4zm-12 6h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4z"
                />
              </svg>
              Compact View
            </>
          ) : (
            <>
              <svg
                className="w-4 h-4 mr-1.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 5a1 1 0 011-1h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5z"
                />
              </svg>
              Masonry View
            </>
          )}
        </button>
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
                className="absolute top-4 right-4 z-10 text-white/80 hover:text-white transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-8 h-8"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
              <div className="relative w-full h-full flex flex-col items-center justify-center bg-black">
                <div className="relative w-full h-full flex items-center justify-center">
                  <img
                    src={cards.find((c) => c.id === expanded)?.thumbnail}
                    alt=""
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
                <div className="w-full bg-white/80 backdrop-blur-sm">
                  {React.cloneElement(
                    cards.find((c) => c.id === expanded)
                      ?.content as React.ReactElement,
                    {
                      onExpand: handleCloseExpanded,
                      isExpanded: true,
                      isCompact: false,
                    }
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

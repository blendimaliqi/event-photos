"use client";
import React, { useState, useEffect } from "react";
import { SortOption } from "../../hooks/useMedia";
import { Link } from "react-router-dom";
import { useEvent } from "../../hooks/useEvent";
import { motion } from "framer-motion";

type Card = {
  id: number;
  content: React.ReactNode;
  className: string;
  thumbnail: string;
  type?: "photo" | "video";
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
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const savedViewMode = localStorage.getItem("viewMode") as ViewMode;
    if (savedViewMode) return savedViewMode;
    return window.innerWidth < 640 ? "grid" : "masonry";
  });

  //Hardcoded event id for now
  const { data: event, isLoading: eventLoading } = useEvent(1);

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

  useEffect(() => {
    const savedPosition = sessionStorage.getItem("scrollPosition");
    if (savedPosition) {
      // Use a small timeout to ensure the DOM is ready and images are loaded
      const timeoutId = setTimeout(() => {
        const scrollPosition = parseInt(savedPosition);
        window.scrollTo({
          top: scrollPosition,
          behavior: "instant",
        });
        sessionStorage.removeItem("scrollPosition");
      }, 0);

      return () => clearTimeout(timeoutId);
    }
  }, [cards]);

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

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: "newest", label: "Më të rejat" },
    { value: "oldest", label: "Më të vjetrat" },
    { value: "withDescription", label: "Me përshkrim" },
  ];

  if (eventLoading) {
    return <div>Loading...</div>;
  }

  if (!event) {
    return <div className="text-center p-4">Loading event...</div>;
  }

  return (
    <>
      {/* Main content */}
      <motion.div className="space-y-4">
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
        <div className={containerClassName}>
          {cards.map((card) => (
            <div
              key={card.id}
              className={
                viewMode === "masonry" ? "break-inside-avoid mb-6" : ""
              }
            >
              <Link
                to={`/photo/${card.id}`}
                className={`relative overflow-hidden rounded-3xl cursor-pointer shadow-xl group block ${
                  viewMode === "compact" ? "rounded-lg" : "rounded-3xl"
                }`}
                onClick={(_) => {
                  // Save scroll position
                  const scrollY = window.scrollY;
                  sessionStorage.setItem(
                    "originalScrollPosition",
                    scrollY.toString()
                  );
                  sessionStorage.setItem("scrollPosition", scrollY.toString());

                  // Dispatch navigation event
                  window.dispatchEvent(new Event("navigationStart"));
                }}
              >
                {card.type === "video" ? (
                  <div
                    className={`w-full bg-gray-100 ${
                      viewMode === "masonry"
                        ? "aspect-square"
                        : viewMode === "grid"
                        ? "aspect-[3/4]"
                        : "aspect-[1/1]"
                    } flex items-center justify-center relative overflow-hidden`}
                    style={{
                      backgroundImage: `url(${card.thumbnail})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  >
                    {/* Play button overlay */}
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-12 h-12 text-white/90"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z"
                        />
                      </svg>
                    </div>
                  </div>
                ) : (
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
                )}
                {card.type === "video" && (
                  <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-full text-white text-xs font-medium flex items-center gap-1 z-10">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-3 h-3"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z"
                      />
                    </svg>
                    Video
                  </div>
                )}
                {(card.content as any)?.props?.media?.description && (
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
                  className={`absolute inset-0 bg-gradient-to-b from-transparent via-black/30 to-black/70 transition-opacity duration-300 opacity-0 group-hover:opacity-100`}
                />
                <div className="absolute inset-x-0 top-1/2 bottom-0 p-4 text-white transform translate-y-2 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 flex flex-col justify-end">
                  <p className="text-xs text-white/80 mb-2">
                    {new Date(
                      (card.content as any)?.props?.media?.uploadDate
                    ).toLocaleDateString()}{" "}
                    {new Date(
                      (card.content as any)?.props?.media?.uploadDate
                    ).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                  {(card.content as any)?.props?.media?.description && (
                    <p className="text-sm line-clamp-3">
                      {(card.content as any)?.props?.media?.description}
                    </p>
                  )}
                </div>
              </Link>
            </div>
          ))}
        </div>
      </motion.div>
    </>
  );
};

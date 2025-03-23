import { Media } from "../types/media";
import { useEffect, useRef, useState } from "react";
import { ImageWithFallback } from "./ImageWithFallback";

// Define view mode types
export type ViewMode = "masonry" | "grid" | "compact";
// Define sort options
export type SortOption = "latest" | "oldest" | "withMessages";

interface MediaGridProps {
  mediaItems: Media[];
  onMediaSelect: (media: Media) => void;
  isLoading?: boolean; // Add loading prop
}

const MediaGrid = ({
  mediaItems,
  onMediaSelect,
  isLoading = false,
}: MediaGridProps) => {
  const [gridReady, setGridReady] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    // Try to load from localStorage, if not present use default "grid"
    const savedViewMode = localStorage.getItem("eventPhotos_viewMode");
    return (savedViewMode as ViewMode) || "grid";
  });
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [sortOption, setSortOption] = useState<SortOption>(() => {
    // Try to load from localStorage, if not present use default "latest"
    const savedSortOption = localStorage.getItem("eventPhotos_sortOption");
    return (savedSortOption as SortOption) || "latest";
  });
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const sortMenuRef = useRef<HTMLDivElement>(null);

  // Save to localStorage whenever view mode changes
  useEffect(() => {
    localStorage.setItem("eventPhotos_viewMode", viewMode);
  }, [viewMode]);

  // Save to localStorage whenever sort option changes
  useEffect(() => {
    localStorage.setItem("eventPhotos_sortOption", sortOption);
  }, [sortOption]);

  // Effect to ensure all grid items are loaded before displaying
  useEffect(() => {
    if (mediaItems.length === 0) {
      setGridReady(true);
      return;
    }

    // Wait for a short delay to make sure CSS has been applied
    const timer = setTimeout(() => {
      setGridReady(true);
    }, 50);

    return () => clearTimeout(timer);
  }, [mediaItems]);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
      if (
        sortMenuRef.current &&
        !sortMenuRef.current.contains(event.target as Node)
      ) {
        setIsSortMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (mediaItems.length === 0 && !isLoading)
    return <div className="p-3">No media items found</div>;

  if (isLoading && mediaItems.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-10 h-10 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-500">Duke ngarkuar mediat...</p>
        </div>
      </div>
    );
  }

  // Get the sorted media items based on current sort option
  const getSortedMediaItems = () => {
    const items = [...mediaItems]; // Create a copy to avoid mutating props

    switch (sortOption) {
      case "latest":
        return items.sort(
          (a, b) =>
            new Date(b.uploadDate || 0).getTime() -
            new Date(a.uploadDate || 0).getTime()
        );
      case "oldest":
        return items.sort(
          (a, b) =>
            new Date(a.uploadDate || 0).getTime() -
            new Date(b.uploadDate || 0).getTime()
        );
      case "withMessages":
        return items.sort((a, b) => {
          // Sort items with messages first
          const aHasMessage = a.description && a.description.trim().length > 0;
          const bHasMessage = b.description && b.description.trim().length > 0;

          if (aHasMessage && !bHasMessage) return -1;
          if (!aHasMessage && bHasMessage) return 1;

          // If both have or don't have messages, sort by date (latest first)
          return (
            new Date(b.uploadDate || 0).getTime() -
            new Date(a.uploadDate || 0).getTime()
          );
        });
      default:
        return items;
    }
  };

  // Get the display name for the sort option
  const getSortOptionName = () => {
    switch (sortOption) {
      case "latest":
        return "Më të fundit";
      case "oldest":
        return "Më të vjetra";
      case "withMessages":
        return "Mesazhet fillimisht";
      default:
        return "Më të fundit";
    }
  };

  // Get the appropriate grid classes based on view mode
  const getGridClasses = () => {
    switch (viewMode) {
      case "masonry":
        return "columns-1 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4 sm:gap-5 md:gap-6 space-y-4 sm:space-y-5 md:space-y-6";
      case "grid":
        return "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5 md:gap-6";
      case "compact":
        return "grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3 sm:gap-4 md:gap-5";
      default:
        return "grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3 sm:gap-4 md:gap-5";
    }
  };

  // Get the display name for the view mode
  const getViewModeName = () => {
    switch (viewMode) {
      case "masonry":
        return "Pamja Masonry";
      case "grid":
        return "Pamja Grid";
      case "compact":
        return "Pamja Kompakte";
      default:
        return "Pamja Grid";
    }
  };

  // Get the aspect ratio for the current view mode
  const getAspectRatio = (mode: ViewMode) => {
    if (mode === "grid") {
      return "3/4"; // Taller aspect ratio for grid view (2 columns)
    }
    return "1/1"; // Square aspect ratio for other views
  };

  // Get the padding bottom percentage for the current view mode
  const getPaddingBottom = (mode: ViewMode) => {
    if (mode === "grid") {
      return "133.33%"; // 4:3 aspect ratio (taller)
    }
    return "100%"; // 1:1 aspect ratio (square)
  };

  // Render different item layout based on view mode
  const renderMediaItem = (media: Media) => {
    // Check if media has a description
    const hasDescription =
      media.description && media.description.trim().length > 0;

    // Format the date
    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat("sq-AL", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).format(date);
    };

    if (viewMode === "masonry") {
      return (
        <div
          key={`${media.type}-${media.id}`}
          className="break-inside-avoid mb-4 sm:mb-5 md:mb-6 relative overflow-hidden rounded-2xl hover:shadow-xl cursor-pointer transition-all duration-300 group"
          onClick={() => onMediaSelect(media)}
        >
          <div className="group">
            {media.type === "photo" ? (
              <ImageWithFallback
                src={media.url}
                alt={media.description || "Photo"}
                loading="lazy"
                className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="relative">
                {media.thumbnailUrl ? (
                  <ImageWithFallback
                    src={media.thumbnailUrl}
                    alt={media.description || "Video thumbnail"}
                    loading="lazy"
                    className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full aspect-video bg-gradient-to-br from-rose-100 via-pink-200 to-rose-300 flex items-center justify-center">
                    <div className="flex flex-col items-center justify-center p-3">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-8 w-8 text-rose-700 mb-1"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-sm font-medium text-rose-700">
                        Video
                      </span>
                    </div>
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-black bg-opacity-60 text-white rounded-full p-2.5 w-10 h-10 flex items-center justify-center backdrop-blur-sm">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
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
              </div>
            )}
            {/* Message indicator */}
            {hasDescription && (
              <div className="absolute top-2 right-2 bg-white bg-opacity-90 rounded-full p-1.5 w-7 h-7 flex items-center justify-center shadow-md z-5">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-rose-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                  />
                </svg>
              </div>
            )}
            {/* Date overlay (only visible on hover) */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
              <div className="w-full p-3 text-white text-sm font-medium">
                {formatDate(media.uploadDate)}
              </div>
            </div>
          </div>
        </div>
      );
    } else {
      // Grid or compact view
      return (
        <div
          key={`${media.type}-${media.id}`}
          className="relative overflow-hidden rounded-2xl hover:shadow-xl cursor-pointer transition-all duration-300 group"
          style={{
            aspectRatio: getAspectRatio(viewMode),
            height: "0",
            paddingBottom: getPaddingBottom(viewMode),
            position: "relative",
          }}
          onClick={() => onMediaSelect(media)}
        >
          <div className="absolute inset-0 group">
            {media.type === "photo" ? (
              <ImageWithFallback
                src={media.url}
                alt={media.description || "Photo"}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="relative w-full h-full">
                {media.thumbnailUrl ? (
                  <ImageWithFallback
                    src={media.thumbnailUrl}
                    alt={media.description || "Video thumbnail"}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-rose-100 via-pink-200 to-rose-300 flex items-center justify-center">
                    <div className="flex flex-col items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-8 w-8 text-rose-700 mb-1"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-sm font-medium text-rose-700">
                        Video
                      </span>
                    </div>
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-black bg-opacity-60 text-white rounded-full p-2.5 w-10 h-10 flex items-center justify-center backdrop-blur-sm">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
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
              </div>
            )}
            {/* Message indicator */}
            {hasDescription && (
              <div className="absolute top-2 right-2 bg-white bg-opacity-90 rounded-full p-1.5 w-7 h-7 flex items-center justify-center shadow-md z-5">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-rose-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                  />
                </svg>
              </div>
            )}
            {/* Date overlay (only visible on hover) */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
              <div className="w-full p-3 text-white text-sm font-medium">
                {formatDate(media.uploadDate)}
              </div>
            </div>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="space-y-4 relative">
      {/* Show loading overlay if loading new items to an existing collection */}
      {isLoading && mediaItems.length > 0 && (
        <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] flex justify-center items-start z-50 pt-24">
          <div className="animate-pulse flex flex-col items-center">
            <div className="w-8 h-8 border-3 border-rose-200 border-t-rose-500 rounded-full animate-spin mb-3"></div>
            <p className="text-gray-500 text-sm font-medium">
              Duke përditësuar...
            </p>
          </div>
        </div>
      )}

      {/* View and sort options */}
      <div className="flex justify-between items-center px-4 pb-2 relative">
        {/* View mode selector */}
        <div ref={menuRef} className="max-w-[45%] sm:max-w-fit">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex items-center gap-1 w-full justify-start px-2 sm:px-3 py-2 bg-rose-50 text-rose-800 font-serif rounded-xl shadow-sm hover:bg-rose-100 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0"
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
            <span className="truncate text-sm sm:text-base sm:whitespace-nowrap">
              {getViewModeName()}
            </span>
          </button>

          {/* Dropdown menu */}
          {isMenuOpen && (
            <div className="absolute top-full left-4 mt-1 bg-white rounded-lg shadow-lg border border-rose-100 p-1 z-20">
              <button
                onClick={() => {
                  setViewMode("masonry");
                  setIsMenuOpen(false);
                }}
                className={`flex items-center w-full text-left px-4 py-2 text-sm font-serif rounded-md ${
                  viewMode === "masonry"
                    ? "bg-rose-50 text-rose-800"
                    : "text-gray-700 hover:bg-rose-50"
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 6h16M4 10h16M4 14h16M4 18h16"
                  />
                </svg>
                Pamja Masonry
              </button>
              <button
                onClick={() => {
                  setViewMode("grid");
                  setIsMenuOpen(false);
                }}
                className={`flex items-center w-full text-left px-4 py-2 text-sm font-serif rounded-md ${
                  viewMode === "grid"
                    ? "bg-rose-50 text-rose-800"
                    : "text-gray-700 hover:bg-rose-50"
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493m0 0l1.45 4.349M12.568 3.314l-1.45 4.349M18 3h-3.28a1 1 0 00-.948.684L12.568 9M3 13h8m-8 4h8m9-4h-8m6 4h-4"
                  />
                </svg>
                Pamja Grid
              </button>
              <button
                onClick={() => {
                  setViewMode("compact");
                  setIsMenuOpen(false);
                }}
                className={`flex items-center w-full text-left px-4 py-2 text-sm font-serif rounded-md ${
                  viewMode === "compact"
                    ? "bg-rose-50 text-rose-800"
                    : "text-gray-700 hover:bg-rose-50"
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                  />
                </svg>
                Pamja Kompakte
              </button>
            </div>
          )}
        </div>

        {/* Sort selector */}
        <div ref={sortMenuRef} className="max-w-[45%] sm:max-w-fit">
          <button
            onClick={() => setIsSortMenuOpen(!isSortMenuOpen)}
            className="flex items-center gap-1 w-full justify-start px-2 sm:px-3 py-2 bg-rose-50 text-rose-800 font-serif rounded-xl shadow-sm hover:bg-rose-100 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"
              />
            </svg>
            <span className="truncate text-sm sm:text-base sm:whitespace-nowrap">
              {getSortOptionName()}
            </span>
          </button>

          {/* Sort dropdown menu */}
          {isSortMenuOpen && (
            <div className="absolute top-full right-4 mt-1 bg-white rounded-lg shadow-lg border border-rose-100 p-1 z-20">
              <button
                onClick={() => {
                  setSortOption("latest");
                  setIsSortMenuOpen(false);
                }}
                className={`flex items-center w-full text-left px-4 py-2 text-sm font-serif rounded-md ${
                  sortOption === "latest"
                    ? "bg-rose-50 text-rose-800"
                    : "text-gray-700 hover:bg-rose-50"
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Më të fundit
              </button>
              <button
                onClick={() => {
                  setSortOption("oldest");
                  setIsSortMenuOpen(false);
                }}
                className={`flex items-center w-full text-left px-4 py-2 text-sm font-serif rounded-md ${
                  sortOption === "oldest"
                    ? "bg-rose-50 text-rose-800"
                    : "text-gray-700 hover:bg-rose-50"
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Më të vjetra
              </button>
              <button
                onClick={() => {
                  setSortOption("withMessages");
                  setIsSortMenuOpen(false);
                }}
                className={`flex items-center w-full text-left px-4 py-2 text-sm font-serif rounded-md ${
                  sortOption === "withMessages"
                    ? "bg-rose-50 text-rose-800"
                    : "text-gray-700 hover:bg-rose-50"
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                  />
                </svg>
                Mesazhet fillimisht
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Media grid */}
      <div
        ref={gridRef}
        className={`${getGridClasses()} p-2 sm:p-3 ${
          gridReady ? "opacity-100" : "opacity-0"
        } transition-opacity duration-200`}
        style={
          viewMode !== "masonry"
            ? {
                gridAutoRows: "1fr",
                WebkitBackfaceVisibility: "hidden",
              }
            : undefined
        }
      >
        {getSortedMediaItems().map((media) => renderMediaItem(media))}
      </div>
    </div>
  );
};

export default MediaGrid;

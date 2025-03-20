import { Media } from "../types/media";
import { useEffect, useRef, useState } from "react";
import { ImageWithFallback } from "./ImageWithFallback";

// Define view mode types
export type ViewMode = "masonry" | "grid" | "compact";

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
  const [viewMode, setViewMode] = useState<ViewMode>("grid"); // Default to grid view
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

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

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
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

  // Get the appropriate grid classes based on view mode
  const getGridClasses = () => {
    switch (viewMode) {
      case "masonry":
        return "columns-1 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-3 sm:gap-4 md:gap-5 space-y-3 sm:space-y-4 md:space-y-5";
      case "grid":
        return "grid grid-cols-2 gap-3 sm:gap-4 md:gap-5";
      case "compact":
        return "grid grid-cols-3 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-2 sm:gap-3 md:gap-4";
      default:
        return "grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-2 sm:gap-3 md:gap-4";
    }
  };

  // Get the display name for the view mode
  const getViewModeName = () => {
    switch (viewMode) {
      case "masonry":
        return "Pamja Fascia";
      case "grid":
        return "Pamja Rrjetë";
      case "compact":
        return "Pamja Kompakte";
      default:
        return "Pamja Rrjetë";
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
    if (viewMode === "masonry") {
      return (
        <div
          key={`${media.type}-${media.id}`}
          className="break-inside-avoid mb-3 sm:mb-4 md:mb-5 relative overflow-hidden rounded-md hover:shadow-lg cursor-pointer transition-all duration-300"
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
                  <div className="w-full aspect-video bg-gray-100 flex items-center justify-center">
                    <span className="text-sm text-gray-500">Video</span>
                  </div>
                )}
                <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white rounded-full p-1 w-6 h-6 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3.5 w-3.5"
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
            )}
          </div>
        </div>
      );
    } else {
      // Grid or compact view
      return (
        <div
          key={`${media.type}-${media.id}`}
          className="relative overflow-hidden rounded-md hover:shadow-lg cursor-pointer transition-all duration-300"
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
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <span className="text-sm text-gray-500">Video</span>
                  </div>
                )}
                <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white rounded-full p-1 w-6 h-6 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3.5 w-3.5"
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
            )}
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

      {/* View mode selector - styled like the image */}
      <div className="flex justify-start px-4 pb-2 relative" ref={menuRef}>
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-800 font-serif rounded-lg shadow-sm hover:bg-rose-100 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
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
          <span>{getViewModeName()}</span>
        </button>

        {/* Dropdown menu */}
        {isMenuOpen && (
          <div className="absolute top-full left-4 mt-1 bg-white rounded-lg shadow-lg border border-rose-100 p-1 z-10">
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
              Pamja Fascia
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
              Pamja Rrjetë
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

      {/* Media grid */}
      <div
        ref={gridRef}
        className={`${getGridClasses()} p-1 sm:p-2 ${
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
        {mediaItems.map((media) => renderMediaItem(media))}
      </div>
    </div>
  );
};

export default MediaGrid;

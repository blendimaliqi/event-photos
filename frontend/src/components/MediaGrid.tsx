import { useState, useEffect, useCallback } from "react";
import { useMedia, SortOption } from "../hooks/useMedia";
import { useEvent } from "../hooks/useEvent";
import { useNavigate, useParams } from "react-router-dom";
import { Media } from "../types/media";
import { MediaViewer } from "./MediaViewer";
import { config } from "../config/config";

// Type declaration for global debug function
declare global {
  interface Window {
    debugLG?: (msg: string) => void;
  }
}

// Preload LightGallery resources
import "lightgallery/css/lightgallery.css";
import "lightgallery/css/lg-zoom.css";
import "lightgallery/css/lg-video.css";

interface MediaGridProps {
  eventId: number;
  isMediaView?: boolean;
}

export function MediaGrid({ eventId, isMediaView = false }: MediaGridProps) {
  const { photoId } = useParams<{ photoId: string }>();
  const navigate = useNavigate();

  const [sortBy, setSortBy] = useState<SortOption>(() => {
    const savedSort = sessionStorage.getItem("mediaSortPreference");
    return (savedSort as SortOption) || "newest";
  });

  const { data: mediaItems = [], isLoading } = useMedia(eventId, sortBy);
  const { data: event } = useEvent(eventId);
  const [viewMode, setViewMode] = useState<"masonry" | "grid" | "compact">(
    () => {
      const savedViewMode = localStorage.getItem("viewMode") as any;
      if (savedViewMode) return savedViewMode;
      return window.innerWidth < 640 ? "grid" : "masonry";
    }
  );

  // Add state for selected media index
  const [selectedMediaIndex, setSelectedMediaIndex] = useState<number>(-1);
  const [isViewerReady, setIsViewerReady] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile devices
  useEffect(() => {
    // Use a ref to prevent duplicate logs in React strict mode
    const isInitialMount = { current: true };

    const checkMobile = () => {
      const mobile =
        window.innerWidth < 768 ||
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        );
      setIsMobile(mobile);

      if (isInitialMount.current) {
        if (window.debugLG) {
          window.debugLG(`MediaGrid: Mobile device detected: ${mobile}`);
        } else {
          console.log(`[MediaGrid] Mobile device: ${mobile}`);
        }
        isInitialMount.current = false;
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Update session storage when sort changes
  useEffect(() => {
    sessionStorage.setItem("mediaSortPreference", sortBy);
  }, [sortBy]);

  // Filter out hero photo before displaying
  const filteredMedia = mediaItems.filter((media) => {
    if (event?.heroPhoto) {
      return media.id !== event.heroPhoto.id || media.type === "video";
    }
    return true; // If no hero photo, include all media
  });

  // Handle media item selection - optimized for mobile
  const handleMediaSelect = useCallback(
    (media: Media) => {
      console.log(`[MediaGrid] Media selected: ${media.id}`);

      // Save current scroll position
      const scrollY = window.scrollY;
      sessionStorage.setItem("originalScrollPosition", scrollY.toString());
      sessionStorage.setItem("scrollPosition", scrollY.toString());

      // Find the index of the selected media
      const index = filteredMedia.findIndex((item) => item.id === media.id);
      if (index !== -1) {
        setSelectedMediaIndex(index);

        // For mobile, show viewer immediately then navigate
        if (isMobile) {
          setIsViewerReady(true);
          // Use history.pushState directly instead of navigate for better performance
          window.history.pushState(null, "", `/photo/${media.id}`);
        } else {
          // Desktop path remains the same
          setIsViewerReady(true);
          setTimeout(() => {
            navigate(`/photo/${media.id}`);
          }, 0);
        }
      } else {
        console.error(`[MediaGrid] Media index not found for id: ${media.id}`);
      }
    },
    [filteredMedia, navigate, isMobile]
  );

  // Find the media index whenever the photoId changes
  useEffect(() => {
    if (isMediaView && photoId && filteredMedia.length > 0) {
      const filteredIndex = filteredMedia.findIndex(
        (media) => media.id === Number(photoId)
      );

      if (filteredIndex !== -1) {
        setSelectedMediaIndex(filteredIndex);
        // Set viewer ready immediately for faster loading
        setIsViewerReady(true);
      } else {
        // If photo not found, navigate back to main view
        navigate("/");
      }
    }
  }, [isMediaView, photoId, filteredMedia, navigate]);

  // Preload first few images for better performance
  useEffect(() => {
    if (filteredMedia.length === 0) return;

    // Only preload the first few images
    const preloadCount = Math.min(3, filteredMedia.length);
    for (let i = 0; i < preloadCount; i++) {
      const media = filteredMedia[i];
      if (media.type === "photo") {
        const img = new Image();
        img.src = config.getImageUrl(media.url);
      }
    }
  }, [filteredMedia]);

  // Handle close of media view
  const handleCloseMediaView = useCallback(() => {
    // Save scroll position
    const scrollY = Number(
      sessionStorage.getItem("originalScrollPosition") || "0"
    );
    sessionStorage.setItem("scrollPosition", scrollY.toString());
    setIsViewerReady(false);
    navigate("/");
  }, [navigate]);

  // Handle navigation in media view
  const handleNavigate = useCallback((mediaId: number) => {
    // Update URL without triggering a full navigation
    window.history.replaceState(null, "", `/photo/${mediaId}`);
  }, []);

  // Toggle view mode function
  const toggleViewMode = useCallback(() => {
    const newViewMode =
      viewMode === "masonry"
        ? "grid"
        : viewMode === "grid"
        ? "compact"
        : "masonry";
    setViewMode(newViewMode);
    localStorage.setItem("viewMode", newViewMode);
  }, [viewMode]);

  // Sort options
  const sortOptions: { value: SortOption; label: string }[] = [
    { value: "newest", label: "Më të rejat" },
    { value: "oldest", label: "Më të vjetrat" },
    { value: "withDescription", label: "Me përshkrim" },
  ];

  // Render the media viewer when in media view mode - keep it out of Suspense for faster loading
  if (
    isMediaView &&
    isViewerReady &&
    selectedMediaIndex >= 0 &&
    filteredMedia.length > 0
  ) {
    return (
      <MediaViewer
        mediaItems={filteredMedia}
        initialMediaIndex={selectedMediaIndex}
        onClose={handleCloseMediaView}
        onNavigate={handleNavigate}
      />
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="text-center p-4 text-gray-600">
        Duke ngarkuar momentet...
      </div>
    );
  }

  // Define classes for different view modes
  const containerClassName =
    viewMode === "masonry"
      ? "columns-1 sm:columns-2 lg:columns-3 xl:columns-4 2xl:columns-4 gap-4 px-4 sm:px-0"
      : viewMode === "grid"
      ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 px-4 sm:px-0"
      : "grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-10 gap-4 px-4 sm:px-0";

  // Regular grid view for media items
  return (
    <div className="relative w-full">
      <div className="space-y-4">
        {/* Sort controls */}
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
            onChange={(e) => setSortBy(e.target.value as SortOption)}
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

        {filteredMedia.length === 0 ? (
          <div className="text-center p-12 text-gray-500">
            Bëhu i pari që ndan një moment nga dasma!
          </div>
        ) : (
          <div className={containerClassName}>
            {/* Render media items */}
            {filteredMedia.map((media) => (
              <div
                key={media.id}
                className={
                  viewMode === "masonry" ? "break-inside-avoid mb-6" : ""
                }
              >
                <div
                  onClick={() => handleMediaSelect(media)}
                  className={`relative overflow-hidden cursor-pointer shadow-xl group block ${
                    viewMode === "compact" ? "rounded-lg" : "rounded-3xl"
                  }`}
                >
                  {media.type === "video" ? (
                    <div
                      className={`w-full bg-gray-100 ${
                        viewMode === "masonry"
                          ? "aspect-square"
                          : viewMode === "grid"
                          ? "aspect-[3/4]"
                          : "aspect-[1/1]"
                      } flex items-center justify-center relative overflow-hidden`}
                      style={{
                        backgroundImage: media.thumbnailUrl
                          ? `url(${config.getImageUrl(media.thumbnailUrl)})`
                          : "linear-gradient(to bottom right, #111827, #374151)",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                      aria-label="Video thumbnail"
                    >
                      {/* Play button overlay */}
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                        <div className="bg-black/50 rounded-full p-3 backdrop-blur-sm">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-8 h-8 text-white"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <img
                      src={config.getImageUrl(media.url)}
                      alt={media.description || ""}
                      className={`w-full object-cover ${
                        viewMode === "masonry"
                          ? "aspect-square"
                          : viewMode === "grid"
                          ? "aspect-[3/4]"
                          : "aspect-[1/1]"
                      }`}
                      loading="lazy"
                    />
                  )}
                  {media.type === "video" && (
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
                  {media.description && (
                    <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-full text-white text-xs font-medium flex items-center gap-1 z-10">
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
                          d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"
                        />
                      </svg>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

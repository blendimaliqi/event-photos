import {
  useState,
  Suspense,
  lazy,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { useMedia, SortOption } from "../hooks/useMedia";
import { config } from "../config/config";
import { useEvent } from "../hooks/useEvent";
import { useNavigate, useParams } from "react-router-dom";
import { Media } from "../types/media";

// Lazy load gallery components
const LightGalleryComponent = lazy(() =>
  import("./LightGalleryComponent").then((module) => ({
    default: module.LightGalleryComponent,
  }))
);

// Loading component for gallery view
const GalleryLoadingComponent = () => (
  <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin" />
  </div>
);

interface MediaGridProps {
  eventId: number;
  isMediaView?: boolean;
}

export function MediaGrid({ eventId, isMediaView = false }: MediaGridProps) {
  const { photoId } = useParams<{ photoId: string }>();
  const navigate = useNavigate();
  const [galleryKey, setGalleryKey] = useState<string>(`gallery-initial`);

  const [sortBy, setSortBy] = useState<SortOption>(() => {
    const savedSort = sessionStorage.getItem("mediaSortPreference");
    return (savedSort as SortOption) || "newest";
  });

  const { data: mediaItems = [], isLoading, error } = useMedia(eventId, sortBy);
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

  // Add mobile detection
  const [isMobile, setIsMobile] = useState<boolean>(false);

  // Check if running on mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Optimize performance on mobile
  useEffect(() => {
    // Clean up video elements when component unmounts or changes
    return () => {
      // Find all video elements and pause them
      const videos = document.querySelectorAll("video");
      videos.forEach((video) => {
        video.pause();
        video.src = "";
        video.load();
      });
    };
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

  // Recalculate the selected index based on the filtered media
  useEffect(() => {
    if (isMediaView && photoId && filteredMedia.length > 0) {
      const filteredIndex = filteredMedia.findIndex(
        (media) => media.id === Number(photoId)
      );
      if (filteredIndex !== -1 && filteredIndex !== selectedMediaIndex) {
        setSelectedMediaIndex(filteredIndex);
        // Update gallery key to force re-render
        setGalleryKey(`gallery-${photoId}-${filteredIndex}-${Date.now()}`);
        console.log(
          `Selected media index set to ${filteredIndex} for photo ID ${photoId}`
        );
      } else if (filteredIndex === -1) {
        // If photo not found in filtered array, navigate back to main view
        console.log(
          `Photo ID ${photoId} not found in filtered media, navigating back`
        );
        navigate("/");
      }
    }
  }, [isMediaView, photoId, filteredMedia, navigate, selectedMediaIndex]);

  // Handle close of media view
  const handleCloseMediaView = () => {
    // Save scroll position
    const scrollY = Number(
      sessionStorage.getItem("originalScrollPosition") || "0"
    );
    sessionStorage.setItem("scrollPosition", scrollY.toString());
    navigate("/");
  };

  // Handle media item selection
  const handleMediaSelect = (media: Media) => {
    // Save current scroll position
    const scrollY = window.scrollY;
    sessionStorage.setItem("originalScrollPosition", scrollY.toString());
    sessionStorage.setItem("scrollPosition", scrollY.toString());

    // Find the index of the selected media
    const index = filteredMedia.findIndex((item) => item.id === media.id);
    if (index !== -1) {
      // Update the selected index and gallery key
      setSelectedMediaIndex(index);
      setGalleryKey(`gallery-select-${media.id}-${index}-${Date.now()}`);
    }

    // Navigate to media view
    navigate(`/photo/${media.id}`);
  };

  // Handle slide change in gallery
  const handleSlideChange = (index: number) => {
    if (filteredMedia[index] && Number(photoId) !== filteredMedia[index].id) {
      // Update URL without triggering a full navigation
      window.history.replaceState(
        null,
        "",
        `/photo/${filteredMedia[index].id}`
      );
    }
  };

  const [visibleItems, setVisibleItems] = useState<number[]>([]);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const itemRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

  // Setup intersection observer for lazy loading
  useEffect(() => {
    // Create a single observer and reuse it
    if (!observerRef.current) {
      console.log("Creating new intersection observer");

      // Create new intersection observer that keeps track of visible items
      observerRef.current = new IntersectionObserver(
        (entries) => {
          let itemsChanged = false;
          const newVisibleItems = [...visibleItems]; // Start with current visible items

          entries.forEach((entry) => {
            const id = Number(entry.target.getAttribute("data-id"));
            if (id && entry.isIntersecting && !visibleItems.includes(id)) {
              newVisibleItems.push(id);
              itemsChanged = true;
              // Stop observing once it's visible - we never want to remove it
              if (entry.target && observerRef.current) {
                observerRef.current.unobserve(entry.target);
              }
            }
          });

          if (itemsChanged) {
            setVisibleItems(newVisibleItems);
          }
        },
        {
          rootMargin: "300px", // Increased margin to load more items in advance
          threshold: 0.1, // Only need to be 10% visible to count
        }
      );
    }

    // Clean up the observer when component unmounts
    return () => {
      if (observerRef.current) {
        console.log("Disconnecting intersection observer");
        observerRef.current.disconnect();
      }
    };
  }, []); // Only run once on mount

  // Clean up memory when component unmounts
  useEffect(() => {
    return () => {
      // Clear all media elements to prevent memory leaks
      const images = document.querySelectorAll("img");
      images.forEach((img) => {
        img.src = "";
        img.srcset = "";
      });

      const videos = document.querySelectorAll("video");
      videos.forEach((video) => {
        video.pause();
        video.src = "";
        video.innerHTML = "";
        video.load();
      });

      // Clear refs
      itemRefs.current = {};
    };
  }, []);

  // Pagination for mobile devices
  const ITEMS_PER_PAGE = isMobile ? 12 : 30;
  const [currentPage, setCurrentPage] = useState(1);

  // Calculate visible items for pagination
  const paginatedMedia = useMemo(() => {
    // When on mobile, use pagination but keep previously loaded items
    if (isMobile) {
      // Instead of slicing to just current page, include all pages up to current
      const endIndex = currentPage * ITEMS_PER_PAGE;
      return filteredMedia.slice(0, endIndex);
    }
    // On desktop, show all items
    return filteredMedia;
  }, [filteredMedia, currentPage, ITEMS_PER_PAGE, isMobile]);

  // Register new items with the observer
  useEffect(() => {
    // Skip if no observer or no new items
    if (!observerRef.current || paginatedMedia.length === 0) return;

    console.log(`Registering ${paginatedMedia.length} items with observer`);

    // Only observe items that aren't already in visibleItems
    // We need to carefully manage which items are being observed
    paginatedMedia.forEach((media) => {
      const ref = itemRefs.current[media.id];

      // If we have a ref for this item but it's not yet visible, observe it
      if (ref && !visibleItems.includes(media.id)) {
        observerRef.current?.observe(ref);
      }
    });

    return () => {
      // Don't disconnect the observer here to avoid flickering
    };
  }, [paginatedMedia.length, visibleItems]);

  // Item ref callback with improved tracking
  const setItemRef = useCallback(
    (element: HTMLDivElement | null, id: number) => {
      if (!element) {
        // Element was removed, clear its ref
        if (itemRefs.current[id]) {
          delete itemRefs.current[id];
        }
        return;
      }

      // Store the ref
      itemRefs.current[id] = element;

      // If not already visible, observe it
      if (observerRef.current && !visibleItems.includes(id)) {
        observerRef.current.observe(element);
      }
    },
    [visibleItems]
  );

  // Handle loading more items when scrolling
  const handleLoadMore = useCallback(() => {
    if (isMobile) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      console.log(`Loading more items: page ${nextPage}`);
    }
  }, [isMobile, currentPage]);

  // Setup scroll listener for infinite loading on mobile
  useEffect(() => {
    if (!isMobile) return;

    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 500
      ) {
        handleLoadMore();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isMobile, handleLoadMore]);

  // Prevent videos from loading or autoplaying
  useEffect(() => {
    // Find all video elements and ensure they're paused and have preload=none
    const preventVideoLoading = () => {
      const videos = document.querySelectorAll("video");
      videos.forEach((video) => {
        // Ensure video doesn't autoplay or preload
        video.autoplay = false;
        video.preload = "none";

        // Pause any playing videos
        if (!video.paused) {
          video.pause();
        }

        // Clear sources if not in view
        const rect = video.getBoundingClientRect();
        const isInViewport =
          rect.top >= -rect.height &&
          rect.left >= -rect.width &&
          rect.bottom <= window.innerHeight + rect.height &&
          rect.right <= window.innerWidth + rect.width;

        if (!isInViewport && video.src) {
          const currentSrc = video.src;
          // Store the original src and clear it
          video.setAttribute("data-src", currentSrc);
          video.src = "";
          video.load();
        }
      });
    };

    // Run initially and set up interval
    preventVideoLoading();
    const interval = setInterval(preventVideoLoading, 1000);

    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="text-center p-4 text-gray-600">
        Duke ngarkuar momentet...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-4">
        Gabim:{" "}
        {error instanceof Error ? error.message : "Dështoi ngarkimi i mediave"}
      </div>
    );
  }

  if (!mediaItems?.length) {
    return (
      <div className="text-center text-gray-600 p-4">
        Bëhu i pari që ndan një moment nga dasma!
      </div>
    );
  }

  if (isMediaView) {
    return (
      <Suspense fallback={<GalleryLoadingComponent />}>
        <LightGalleryComponent
          key={galleryKey}
          mediaItems={filteredMedia}
          startIndex={selectedMediaIndex < 0 ? 0 : selectedMediaIndex}
          onClose={handleCloseMediaView}
          onSlide={handleSlideChange}
          thumbnailsEnabled={true}
        />
      </Suspense>
    );
  }

  // Sort options
  const sortOptions: { value: SortOption; label: string }[] = [
    { value: "newest", label: "Më të rejat" },
    { value: "oldest", label: "Më të vjetrat" },
    { value: "withDescription", label: "Me përshkrim" },
  ];

  // Define classes for different view modes
  const containerClassName =
    viewMode === "masonry"
      ? "columns-1 sm:columns-2 lg:columns-3 xl:columns-4 2xl:columns-4 gap-4 px-4 sm:px-0"
      : viewMode === "grid"
      ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 px-4 sm:px-0"
      : "grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-10 gap-4 px-4 sm:px-0";

  // Toggle view mode function
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

      <div className={containerClassName}>
        {paginatedMedia.map((media) => (
          <div
            key={media.id}
            ref={(el) => setItemRef(el, media.id)}
            data-id={media.id}
            className={viewMode === "masonry" ? "break-inside-avoid mb-6" : ""}
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

      {isMobile && currentPage * ITEMS_PER_PAGE < filteredMedia.length && (
        <div className="flex justify-center mt-8 mb-12">
          <button
            onClick={handleLoadMore}
            className="px-4 py-2 bg-rose-100 text-rose-800 rounded-full text-sm font-medium hover:bg-rose-200 transition-colors mr-2"
          >
            Shfaq më shumë
          </button>

          {/* Reset button to clear items if user experiences issues */}
          {visibleItems.length > 30 && (
            <button
              onClick={() => {
                // Instead of resetting to page 1, we'll just refresh the current view
                // Keep the current page but refresh the observer
                if (observerRef.current) {
                  observerRef.current.disconnect();
                }

                // Force a refresh of all items
                Object.entries(itemRefs.current).forEach(([id, ref]) => {
                  if (ref && observerRef.current) {
                    observerRef.current.observe(ref);
                  }
                });

                // Clean up any video elements
                const videos = document.querySelectorAll("video");
                videos.forEach((video) => {
                  video.pause();
                  video.src = "";
                  video.load();
                });

                // Reset window scroll position to current position
                const currentPos = window.scrollY;
                window.scrollTo(0, currentPos);

                console.log("Media view refreshed");
              }}
              className="px-4 py-2 bg-gray-100 text-gray-800 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors"
            >
              Rifresko
            </button>
          )}
        </div>
      )}
    </div>
  );
}

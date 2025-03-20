import { Media } from "../types/media";
import { useEffect, useRef, useState } from "react";

interface MediaGridProps {
  mediaItems: Media[];
  onMediaSelect: (media: Media) => void;
}

const MediaGrid = ({ mediaItems, onMediaSelect }: MediaGridProps) => {
  const [gridReady, setGridReady] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);

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

  if (mediaItems.length === 0)
    return <div className="p-3">No media items found</div>;

  return (
    <div
      ref={gridRef}
      className={`grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-1 sm:gap-2 p-1 sm:p-2 ${
        gridReady ? "opacity-100" : "opacity-0"
      } transition-opacity duration-200`}
      style={{
        // Use CSS grid for consistent sizing
        gridAutoRows: "1fr",
        // Force height calculation using a trick that makes grid items respect aspect ratio
        // This ensures all grid cells have the same height
        WebkitBackfaceVisibility: "hidden",
      }}
    >
      {mediaItems.map((media) => (
        <div
          key={`${media.type}-${media.id}`}
          className="relative overflow-hidden rounded-sm hover:shadow-lg cursor-pointer transition-all duration-300"
          style={{
            // Force aspect ratio to be square
            aspectRatio: "1/1",
            // Ensure this works on all browsers
            height: "0",
            paddingBottom: "100%",
            // Position content absolutely within this container
            position: "relative",
          }}
          onClick={() => onMediaSelect(media)}
        >
          <div className="absolute inset-0 group">
            {media.type === "photo" ? (
              <img
                src={media.url}
                alt={media.description || "Photo"}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="relative w-full h-full">
                {media.thumbnailUrl ? (
                  <img
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
                <div className="absolute bottom-1 right-1 bg-black bg-opacity-70 text-white rounded-full p-1 w-6 h-6 flex items-center justify-center">
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
      ))}
    </div>
  );
};

export default MediaGrid;

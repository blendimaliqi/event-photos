import React, { RefObject } from "react";
import { Media } from "../../types/media";

interface ThumbnailsGalleryProps {
  mediaItems: Media[];
  currentIndex: number;
  showThumbnails: boolean;
  isFullscreen: boolean;
  thumbnailsContainerRef: RefObject<HTMLDivElement>;
  thumbnailRefs: RefObject<(HTMLDivElement | null)[]>;
  handleThumbnailClick: (index: number) => void;
}

const ThumbnailsGallery: React.FC<ThumbnailsGalleryProps> = ({
  mediaItems,
  currentIndex,
  showThumbnails,
  isFullscreen,
  thumbnailsContainerRef,
  thumbnailRefs,
  handleThumbnailClick,
}) => {
  return (
    <div
      className={`absolute bottom-0 left-0 right-0 bg-black/80 z-30 transition-transform duration-300 ${
        showThumbnails && !isFullscreen ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div className="max-w-screen-xl mx-auto p-3">
        <div className="overflow-x-auto" ref={thumbnailsContainerRef}>
          <div className="flex gap-2 pb-1">
            {mediaItems.map((media, idx) => (
              <div
                key={`thumb-${media.type}-${media.id}`}
                ref={(el) => {
                  if (thumbnailRefs.current) {
                    thumbnailRefs.current[idx] = el;
                  }
                }}
                className={`flex-shrink-0 w-16 h-16 cursor-pointer transition-all rounded overflow-hidden ${
                  idx === currentIndex
                    ? "ring-2 ring-white scale-110"
                    : "opacity-70 hover:opacity-100"
                }`}
                onClick={() => handleThumbnailClick(idx)}
              >
                {media.type === "photo" ? (
                  <img
                    src={media.url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="relative w-full h-full">
                    <img
                      src={media.thumbnailUrl || ""}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-0.5 right-0.5 bg-black/70 rounded-full flex items-center justify-center w-4 h-4">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-2.5 w-2.5 text-white"
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
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThumbnailsGallery;

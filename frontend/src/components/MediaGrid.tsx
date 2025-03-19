import { useState } from "react";
import { Media } from "../types/media";

interface MediaGridProps {
  mediaItems: Media[];
  onMediaSelect: (media: Media) => void;
}

const MediaGrid = ({ mediaItems, onMediaSelect }: MediaGridProps) => {
  const [loading, setLoading] = useState(false);

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );

  if (mediaItems.length === 0)
    return <div className="p-3">No media items found</div>;

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-1 sm:gap-2 p-1 sm:p-2">
      {mediaItems.map((media) => (
        <div
          key={`${media.type}-${media.id}`}
          className="group relative aspect-square overflow-hidden rounded-sm hover:shadow-lg cursor-pointer transition-all duration-300"
          onClick={() => onMediaSelect(media)}
        >
          {media.type === "photo" ? (
            <img
              src={media.url}
              alt={media.description || "Photo"}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="relative w-full h-full">
              {media.thumbnailUrl ? (
                <img
                  src={media.thumbnailUrl}
                  alt={media.description || "Video thumbnail"}
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
      ))}
    </div>
  );
};

export default MediaGrid;

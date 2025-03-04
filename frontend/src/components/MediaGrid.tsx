import { useState, Suspense, lazy, useEffect } from "react";
import { LayoutGrid } from "./ui/layout-grid";
import { useMedia, SortOption } from "../hooks/useMedia";
import { MediaContent } from "./MediaContent";
import { config } from "../config/config";
import { useEvent } from "../hooks/useEvent";

// Lazy load MediaView component
const MediaView = lazy(() =>
  import("./PhotoView").then((module) => {
    console.log("MediaView loaded:", module);
    return {
      default: module.PhotoView,
    };
  })
);

// Loading component for media view
const MediaViewLoading = () => (
  <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin" />
  </div>
);

interface MediaGridProps {
  eventId: number;
  isMediaView?: boolean;
}

export function MediaGrid({ eventId, isMediaView = false }: MediaGridProps) {
  const [sortBy, setSortBy] = useState<SortOption>(() => {
    const savedSort = sessionStorage.getItem("mediaSortPreference");
    return (savedSort as SortOption) || "newest";
  });

  const { data: mediaItems = [], isLoading, error } = useMedia(eventId, sortBy);
  const { data: event } = useEvent(eventId);

  // Update session storage when sort changes
  useEffect(() => {
    sessionStorage.setItem("mediaSortPreference", sortBy);
  }, [sortBy]);

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

  // Filter out hero photo before creating cards
  const filteredMedia = mediaItems.filter((media) => {
    if (event?.heroPhoto) {
      return media.id !== event.heroPhoto.id || media.type === "video";
    }
    return true; // If no hero photo, include all media
  });

  const cards = filteredMedia.map((media) => ({
    id: media.id,
    content: <MediaContent media={media} />,
    className: "",
    thumbnail:
      media.type === "video" && (media as any).thumbnailUrl
        ? config.getImageUrl((media as any).thumbnailUrl)
        : config.getImageUrl(media.url),
    type: media.type,
  }));

  if (isMediaView) {
    console.log(
      "MediaGrid: isMediaView is true, rendering MediaView with",
      cards.length,
      "cards"
    );
    console.log(
      "MediaGrid: Card IDs:",
      cards.map((card) => card.id).join(", ")
    );
    return (
      <Suspense fallback={<MediaViewLoading />}>
        <MediaView cards={cards} />
      </Suspense>
    );
  }

  console.log("MediaGrid: Rendering LayoutGrid with", cards.length, "cards");
  return <LayoutGrid cards={cards} onSortChange={setSortBy} sortBy={sortBy} />;
}

import { useState, Suspense, lazy, useEffect } from "react";
import { LayoutGrid } from "./ui/layout-grid";
import { usePhotos, SortOption } from "../hooks/usePhotos";
import { PhotoContent } from "./PhotoContent";
import { config } from "../config/config";
import { useEvent } from "../hooks/useEvent";

// Lazy load PhotoView component
const PhotoView = lazy(() =>
  import("./PhotoView").then((module) => ({
    default: module.PhotoView,
  }))
);

// Loading component for photo view
const PhotoViewLoading = () => (
  <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin" />
  </div>
);

interface PhotoGridProps {
  eventId: number;
  isPhotoView?: boolean;
}

export function PhotoGrid({ eventId, isPhotoView = false }: PhotoGridProps) {
  const [sortBy, setSortBy] = useState<SortOption>(() => {
    const savedSort = sessionStorage.getItem("photoSortPreference");
    return (savedSort as SortOption) || "newest";
  });

  const { data: photos = [], isLoading, error } = usePhotos(eventId, sortBy);
  const { data: event } = useEvent(eventId);

  // Update session storage when sort changes
  useEffect(() => {
    sessionStorage.setItem("photoSortPreference", sortBy);
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
        {error instanceof Error ? error.message : "Dështoi ngarkimi i fotove"}
      </div>
    );
  }

  if (!photos?.length) {
    return (
      <div className="text-center text-gray-600 p-4">
        Bëhu i pari që ndan një moment nga dasma!
      </div>
    );
  }

  // Filter out hero photo before creating cards
  const filteredPhotos = photos.filter((photo) => {
    if (event?.heroPhoto) {
      return photo.id !== event.heroPhoto.id;
    }
    return true; // If no hero photo, include all photos
  });

  const cards = filteredPhotos.map((photo) => ({
    id: photo.id,
    content: <PhotoContent photo={photo} />,
    className: "",
    thumbnail: config.getImageUrl(photo.url),
  }));

  if (isPhotoView) {
    return (
      <Suspense fallback={<PhotoViewLoading />}>
        <PhotoView cards={cards} />
      </Suspense>
    );
  }

  return <LayoutGrid cards={cards} onSortChange={setSortBy} sortBy={sortBy} />;
}

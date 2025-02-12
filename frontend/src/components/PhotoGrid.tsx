import React, { useState } from "react";
import { LayoutGrid } from "./ui/layout-grid";
import { usePhotos, SortOption } from "../hooks/usePhotos";
import { PhotoContent } from "./PhotoContent";
import { config } from "../config/config";
import { PhotoView } from "./PhotoView";
import { useParams } from "react-router-dom";

interface PhotoGridProps {
  eventId: number;
  isPhotoView?: boolean;
}

export function PhotoGrid({ eventId, isPhotoView = false }: PhotoGridProps) {
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const { data: photos = [], isLoading, error } = usePhotos(eventId, sortBy);

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

  const cards = photos.map((photo) => ({
    id: photo.id,
    content: <PhotoContent photo={photo} />,
    className: "",
    thumbnail: config.getImageUrl(photo.url),
  }));

  if (isPhotoView) {
    return <PhotoView cards={cards} />;
  }

  return <LayoutGrid cards={cards} onSortChange={setSortBy} sortBy={sortBy} />;
}

import React, { useState } from "react";
import { LayoutGrid } from "./ui/layout-grid";
import { usePhotos, SortOption } from "../hooks/usePhotos";
import { PhotoContent } from "./PhotoContent";
import { config } from "../config/config";

interface PhotoCardContent {
  id: number;
  content: React.ReactElement;
  className: string;
  thumbnail: string;
}

export function PhotoGrid({ eventId }: { eventId: number }) {
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const { data: photos, isLoading, error } = usePhotos(eventId, sortBy);

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

  const cards: PhotoCardContent[] = photos.map((photo) => {
    const imageUrl = config.getImageUrl(photo.url);
    return {
      id: photo.id,
      content: <PhotoContent photo={photo} />,
      className: "",
      thumbnail: imageUrl,
    };
  });

  return (
    <div className="lg:px-8 py-8">
      <LayoutGrid cards={cards} sortBy={sortBy} onSortChange={setSortBy} />
    </div>
  );
}

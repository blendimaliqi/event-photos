import React from "react";
import { LayoutGrid } from "./ui/layout-grid";
import { usePhotos } from "../hooks/usePhotos";
import { Photo } from "../types/photo";

interface PhotoCardContent {
  id: number;
  content: React.ReactElement;
  className: string;
  thumbnail: string;
}

const PhotoContent = ({ photo }: { photo: Photo }) => {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4">
      <p className="font-serif text-xl md:text-2xl text-gray-800">
        Moment {photo.id}
      </p>
      <p className="text-sm text-gray-600">
        {new Date(photo.uploadDate).toLocaleDateString()}
      </p>
      <p className="text-gray-700 my-2">
        {photo.description || "A beautiful wedding moment"}
      </p>
    </div>
  );
};

export function PhotoGrid({ eventId }: { eventId: number }) {
  const { data: photos, isLoading, error } = usePhotos(eventId);

  if (isLoading) {
    return (
      <div className="text-center p-4 text-gray-600">Loading moments...</div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-4">
        Error:{" "}
        {error instanceof Error ? error.message : "Failed to load photos"}
      </div>
    );
  }

  if (!photos?.length) {
    return (
      <div className="text-center text-gray-600 p-4">
        Be the first to share a moment from the wedding!
      </div>
    );
  }

  const cards: PhotoCardContent[] = photos.map((photo) => {
    const imageUrl = `http://localhost:5035${photo.url}`;
    return {
      id: photo.id,
      content: <PhotoContent photo={photo} />,
      className: "",
      thumbnail: imageUrl,
    };
  });

  return (
    <div className="py-4">
      <LayoutGrid cards={cards} />
    </div>
  );
}

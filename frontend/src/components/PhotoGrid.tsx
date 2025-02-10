import React, { useEffect, useState } from "react";
import { LayoutGrid } from "./ui/layout-grid";

interface Photo {
  id: number;
  url: string;
  description: string;
  eventId: number;
  uploadDate: string;
}

interface PhotoCardContent {
  id: number;
  content: React.ReactElement;
  className: string;
  thumbnail: string;
}

const PhotoContent = ({ photo }: { photo: Photo }) => {
  return (
    <div>
      <p className="font-bold md:text-4xl text-xl text-white">
        Photo {photo.id}
      </p>
      <p className="font-normal text-base text-white">
        {new Date(photo.uploadDate).toLocaleDateString()}
      </p>
      <p className="font-normal text-base my-4 max-w-lg text-neutral-200">
        {photo.description || "No description available"}
      </p>
    </div>
  );
};

export function PhotoGrid({ eventId }: { eventId: number }) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        console.log("Fetching photos from:", `/api/photos/event/${eventId}`);
        const response = await fetch(`/api/photos/event/${eventId}`);

        if (!response.ok) {
          const errorText = await response.text();
          console.error("API Error Response:", errorText);
          throw new Error(
            `Failed to fetch photos: ${response.status} ${response.statusText}`
          );
        }

        const data = await response.json();
        console.log("Received photos:", data);
        setPhotos(data);
      } catch (err) {
        console.error("Error fetching photos:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchPhotos();
  }, [eventId]);

  if (loading) {
    return <div className="text-center p-4 text-white">Loading photos...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500 p-4">Error: {error}</div>;
  }

  if (!photos.length) {
    return (
      <div className="text-center text-white p-4">
        No photos found for this event.
      </div>
    );
  }

  const cards: PhotoCardContent[] = photos.map((photo, index) => {
    const imageUrl = `http://localhost:5035${photo.url}`;
    console.log("Loading image from:", imageUrl); // Debug image URL
    return {
      id: photo.id,
      content: <PhotoContent photo={photo} />,
      className: index % 3 === 0 ? "md:col-span-2" : "col-span-1",
      thumbnail: imageUrl,
    };
  });

  return (
    <div className="min-h-screen bg-neutral-950 py-8">
      <div className="container mx-auto px-4">
        <LayoutGrid cards={cards} />
      </div>
    </div>
  );
}

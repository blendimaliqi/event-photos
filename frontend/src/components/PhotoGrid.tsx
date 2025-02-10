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
    return (
      <div className="text-center p-4 text-gray-600">Loading moments...</div>
    );
  }

  if (error) {
    return <div className="text-center text-red-500 p-4">Error: {error}</div>;
  }

  if (!photos.length) {
    return (
      <div className="text-center text-gray-600 p-4">
        Be the first to share a moment from the wedding!
      </div>
    );
  }

  const cards: PhotoCardContent[] = photos.map((photo, index) => {
    const imageUrl = `http://localhost:5035${photo.url}`;
    console.log("Loading image from:", imageUrl);
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

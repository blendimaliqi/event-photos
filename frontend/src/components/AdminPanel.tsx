import React from "react";
import { usePhotos } from "../hooks/usePhotos";
import { photoService } from "../services/photoService";
import { Photo } from "../types/photo";
import { config } from "../config/config";

export function AdminPanel({ eventId }: { eventId: number }) {
  const { data: photos, isLoading, error, refetch } = usePhotos(eventId);

  const handleDeletePhoto = async (photoId: number) => {
    try {
      await photoService.deletePhoto(photoId);
      await refetch();
    } catch (error) {
      console.error("Failed to delete photo:", error);
      alert("Failed to delete photo. Please try again.");
    }
  };

  if (isLoading) {
    return <div className="text-center p-4">Loading photos...</div>;
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-4">
        Error loading photos:{" "}
        {error instanceof Error ? error.message : "Unknown error"}
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">
        Admin Panel - Photo Management
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {photos?.map((photo: Photo) => (
          <div key={photo.id} className="border rounded-lg p-4 space-y-2">
            <img
              src={config.getImageUrl(photo.url)}
              alt="Wedding photo"
              className="w-full h-48 object-cover rounded"
            />
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">ID: {photo.id}</p>
                <p className="text-sm text-gray-600">
                  Uploaded: {new Date(photo.uploadDate).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => handleDeletePhoto(photo.id)}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

import { usePhotos } from "../hooks/usePhotos";
import { photoService } from "../services/photoService";
import { Photo } from "../types/photo";
import { config } from "../config/config";
import { useEvent, EVENT_QUERY_KEY } from "../hooks/useEvent";
import { useQueryClient } from "@tanstack/react-query";
import { videoService } from "../services/videoService";
import { useMedia, QUERY_KEYS } from "../hooks/useMedia";
import { useState } from "react";
import { ImageWithFallback } from "./ImageWithFallback";

export function AdminPanel({ eventId }: { eventId: number }) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"photos" | "videos">("photos");
  const [selectedFileName, setSelectedFileName] = useState<string>("");
  const { data: event, isLoading: eventLoading } = useEvent(eventId);
  const {
    data: photos,
    isLoading: photosLoading,
    error: photosError,
  } = usePhotos(eventId, "newest");

  const { data: mediaItems, isLoading: mediaLoading } = useMedia(
    eventId,
    "newest"
  );

  // Filter videos from mediaItems
  const videos = mediaItems?.filter((media) => media.type === "video") || [];

  const handleDeletePhoto = async (photoId: number) => {
    try {
      await photoService.deletePhoto(photoId);
      // Invalidate photos query to refetch the list
      await queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.allPhotos(eventId),
      });
    } catch (error) {
      console.error("Failed to delete photo:", error);
      alert("Failed to delete photo. Please try again.");
    }
  };

  const handleDeleteVideo = async (videoId: number) => {
    try {
      await videoService.deleteVideo(videoId);
      // Invalidate media queries to refetch the list
      await queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.allMedia(eventId),
      });
      await queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.allVideos(eventId),
      });
    } catch (error) {
      console.error("Failed to delete video:", error);
      alert("Failed to delete video. Please try again.");
    }
  };

  const handleHeroPhotoUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedFileName(file.name);

    try {
      await photoService.setHeroPhoto(eventId, file);
      // Invalidate both event and photos queries
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: EVENT_QUERY_KEY.event(eventId),
        }),
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.allPhotos(eventId),
        }),
      ]);
      // Refetch the event data to update heroPhotoId
      await queryClient.refetchQueries({
        queryKey: EVENT_QUERY_KEY.event(eventId),
      });
      // Reset the file input
      event.target.value = "";
    } catch (error) {
      console.error("Failed to upload hero photo:", error);
      alert("Failed to upload hero photo. Please try again.");
    }
  };

  if (photosLoading || eventLoading || mediaLoading) {
    return <div className="text-center p-4">Loading media...</div>;
  }

  if (photosError) {
    return (
      <div className="text-center text-red-500 p-4">
        Error loading photos:{" "}
        {photosError instanceof Error ? photosError.message : "Unknown error"}
      </div>
    );
  }

  if (!event) {
    return <div className="text-center p-4">Loading event...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">
        Admin Panel - Media Management
      </h2>

      {/* Hero Photo Upload Section */}
      <div className="mb-8 p-4 border rounded-lg bg-gray-50">
        <h3 className="text-xl font-semibold mb-2">Upload Hero Photo</h3>
        <p className="text-sm text-gray-600 mb-4">
          Select an image to set as the event's hero photo. This will be
          displayed prominently on the event page.
        </p>

        {/* Current hero photo display */}
        {event.heroPhoto && (
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 mb-2">
              Current Hero Photo:
            </p>
            <ImageWithFallback
              src={config.getImageUrl(event.heroPhoto.url)}
              alt="Current hero photo"
              className="w-full max-w-md h-48 object-cover rounded"
            />
            <button
              onClick={async () => {
                try {
                  await photoService.deletePhoto(event.heroPhoto!.id);
                  // Invalidate both event and photos queries
                  await Promise.all([
                    queryClient.invalidateQueries({
                      queryKey: EVENT_QUERY_KEY.event(eventId),
                    }),
                    queryClient.invalidateQueries({
                      queryKey: QUERY_KEYS.allPhotos(eventId),
                    }),
                  ]);
                } catch (error) {
                  console.error("Failed to delete hero photo:", error);
                  alert("Failed to delete hero photo. Please try again.");
                }
              }}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors mt-4"
            >
              Delete Hero Photo
            </button>
          </div>
        )}

        {/* Hero photo upload input */}
        <div className="mt-4">
          <label
            htmlFor="hero-photo-upload"
            className="cursor-pointer inline-flex items-center px-4 py-2 bg-rose-50 text-rose-700 rounded-md hover:bg-rose-100 font-semibold text-sm"
          >
            Choose file
          </label>
          <span className="ml-3 text-sm text-gray-500">
            {selectedFileName || ""}
          </span>
          <input
            id="hero-photo-upload"
            type="file"
            accept="image/*"
            onChange={handleHeroPhotoUpload}
            className="hidden"
          />
        </div>
      </div>

      {/* Tabs for Photos and Videos */}
      <div className="mb-4 border-b">
        <ul className="flex flex-wrap -mb-px">
          <li className="mr-2">
            <button
              className={`inline-block p-4 border-b-2 rounded-t-lg ${
                activeTab === "photos"
                  ? "border-rose-500 text-rose-600"
                  : "border-transparent hover:text-gray-600 hover:border-gray-300"
              }`}
              onClick={() => setActiveTab("photos")}
            >
              Photos
            </button>
          </li>
          <li className="mr-2">
            <button
              className={`inline-block p-4 border-b-2 rounded-t-lg ${
                activeTab === "videos"
                  ? "border-rose-500 text-rose-600"
                  : "border-transparent hover:text-gray-600 hover:border-gray-300"
              }`}
              onClick={() => setActiveTab("videos")}
            >
              Videos
            </button>
          </li>
        </ul>
      </div>

      {/* Photos Tab Content */}
      {activeTab === "photos" && (
        <>
          <h3 className="text-xl font-semibold mb-4">Event Photos</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {photos
              ?.filter((photo) => {
                if (event.heroPhoto) {
                  return photo.id !== event.heroPhoto.id;
                }
                return true; // If no hero photo, include all photos
              })
              .map((photo: Photo) => (
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
                        Uploaded:{" "}
                        {new Date(photo.uploadDate).toLocaleDateString()}
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
        </>
      )}

      {/* Videos Tab Content */}
      {activeTab === "videos" && (
        <>
          <h3 className="text-xl font-semibold mb-4">Event Videos</h3>
          {videos.length === 0 ? (
            <p className="text-center p-4 text-gray-500">
              No videos have been uploaded yet.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {videos.map((video) => (
                <div key={video.id} className="border rounded-lg p-4 space-y-2">
                  <div className="relative">
                    <img
                      src={
                        video.thumbnailUrl
                          ? config.getImageUrl(video.thumbnailUrl)
                          : config.getImageUrl(video.url)
                      }
                      alt="Video thumbnail"
                      className="w-full h-48 object-cover rounded"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-black/40 rounded-full p-3">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="white"
                        >
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-600">ID: {video.id}</p>
                      <p className="text-sm text-gray-600">
                        Uploaded:{" "}
                        {new Date(video.uploadDate).toLocaleDateString()}
                      </p>
                      {video.description && (
                        <p className="text-sm text-gray-600 truncate">
                          {video.description}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteVideo(video.id)}
                      className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

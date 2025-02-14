import { usePhotos, QUERY_KEYS } from "../hooks/usePhotos";
import { photoService } from "../services/photoService";
import { Photo } from "../types/photo";
import { config } from "../config/config";
import { useEvent, EVENT_QUERY_KEY } from "../hooks/useEvent";
import { useQueryClient } from "@tanstack/react-query";

export function AdminPanel({ eventId }: { eventId: number }) {
  const queryClient = useQueryClient();
  const { data: event, isLoading: eventLoading } = useEvent(eventId);
  const {
    data: photos,
    isLoading: photosLoading,
    error: photosError,
  } = usePhotos(eventId, "newest", event?.heroPhotoId || undefined);

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

  const handleHeroPhotoUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

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

  if (photosLoading || eventLoading) {
    return <div className="text-center p-4">Loading photos...</div>;
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

  console.log(event);
  console.log(photos);

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">
        Admin Panel - Photo Management
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
            <img
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
        <input
          type="file"
          accept="image/*"
          onChange={handleHeroPhotoUpload}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-rose-50 file:text-rose-700
            hover:file:bg-rose-100"
        />
      </div>

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

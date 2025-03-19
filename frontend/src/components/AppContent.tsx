import { useState, useEffect } from "react";
import {
  Routes,
  Route,
  useNavigate,
  useParams,
  useLocation,
} from "react-router-dom";
import { Media } from "../types/media";
import MediaGrid from "./MediaGrid";
import MediaViewer from "./MediaViewer";
import { photoService } from "../services/photoService";
import { videoService } from "../services/videoService";
import { photoToMedia, videoToMedia } from "../types/media";
import { DEMO_EVENT_ID } from "../App";
import { HeroSection } from "./HeroSection";
import { PhotoUpload } from "./PhotoUpload";
import { Event } from "../types/event";
import { eventService } from "../services/eventService";
import { useQuery } from "@tanstack/react-query";
import { EVENT_QUERY_KEY } from "../hooks/useEvent";

const AppContent = () => {
  const [allMediaItems, setAllMediaItems] = useState<Media[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { mediaType, mediaId } = useParams<{
    mediaType?: string;
    mediaId?: string;
  }>();

  // Fetch event data to get proper hero photo info
  const { data: eventData } = useQuery({
    queryKey: EVENT_QUERY_KEY.event(DEMO_EVENT_ID),
    queryFn: async () => {
      try {
        return await eventService.getEvent(DEMO_EVENT_ID);
      } catch (error) {
        console.error("Failed to fetch event:", error);
        // Return a default event if the fetch fails
        return {
          id: DEMO_EVENT_ID,
          name: "Event Photos",
          date: new Date().toISOString(),
          description: "Mirë se vini në Galerinë tonë të Dasmës",
          heroPhotoId: undefined,
          photos: [],
        } as Event;
      }
    },
  });

  // Fetch all media on component mount
  useEffect(() => {
    const fetchAllMedia = async () => {
      setLoading(true);
      try {
        const [photos, videos] = await Promise.all([
          photoService.getPhotos(DEMO_EVENT_ID),
          videoService.getVideos(DEMO_EVENT_ID),
        ]);

        // Convert to common Media type
        const photoMedia = photos.map(photoToMedia);
        const videoMedia = videos.map(videoToMedia);

        // Combine and sort by upload date (newest first)
        const allMedia = [...photoMedia, ...videoMedia].sort(
          (a, b) =>
            new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()
        );

        setAllMediaItems(allMedia);

        // If we have photos but no hero photo is set in the event, try to set one
        if (photos.length > 0 && !eventData?.heroPhotoId) {
          console.log("No hero photo set, attempting to find a good candidate");

          // Try to find a photo with Paris/Eiffel in the description
          const parisPhoto = photos.find(
            (photo) =>
              photo.description?.toLowerCase().includes("paris") ||
              photo.description?.toLowerCase().includes("eiffel")
          );

          if (parisPhoto) {
            console.log("Found Paris photo for hero:", parisPhoto);
            try {
              // Call the setHeroPhoto API to update the hero photo
              await photoService.setHeroPhoto(
                DEMO_EVENT_ID,
                new File([], "placeholder.jpg"), // Dummy file, the API will use the photoId
                parisPhoto.description
              );

              console.log("Successfully set hero photo to Paris image");
            } catch (error) {
              console.error("Failed to set Paris photo as hero:", error);
            }
          }
        }
      } catch (error) {
        console.error("Failed to load all media:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllMedia();
  }, [eventData?.heroPhotoId]);

  // Handle media selection - navigate to the proper URL
  const handleMediaSelect = (media: Media) => {
    navigate(`/${media.type}/${media.id}`);
  };

  // Handle gallery close - return to main view
  const handleCloseViewer = () => {
    navigate("/");
  };

  // Find the currently selected media item
  const selectedMedia =
    mediaType && mediaId
      ? allMediaItems.find(
          (item) => item.type === mediaType && item.id === Number(mediaId)
        )
      : undefined;

  // Check if we're on the gallery view route
  const isGalleryView = Boolean(mediaType && mediaId);

  // Create a complete event object for the HeroSection component
  const completeEvent: Event = eventData || {
    id: DEMO_EVENT_ID,
    name: "Event Photos",
    date: new Date().toISOString(),
    description: "Mirë se vini në Galerinë tonë të Dasmës",
    heroPhotoId: undefined,
    photos: [],
  };

  // If we have a hero photo from the event, make sure it's used
  // Otherwise, look for a matching photo in the media items
  if (!completeEvent.heroPhoto && allMediaItems.length > 0) {
    // Try different strategies to find the best hero photo
    let heroMediaItem: Media | undefined;

    // Strategy 1: Use the photo specified by heroPhotoId
    if (completeEvent.heroPhotoId) {
      heroMediaItem = allMediaItems.find(
        (item) => item.type === "photo" && item.id === completeEvent.heroPhotoId
      );
      console.log("Found hero photo by ID:", heroMediaItem);
    }

    // Strategy 2: Look for a Paris/Eiffel Tower photo
    if (!heroMediaItem) {
      heroMediaItem = allMediaItems.find(
        (item) =>
          item.type === "photo" &&
          (item.description?.toLowerCase().includes("paris") ||
            item.description?.toLowerCase().includes("eiffel"))
      );
      console.log("Found Paris photo:", heroMediaItem);
    }

    // Strategy 3: Look for any photo with wedding-related terms
    if (!heroMediaItem) {
      heroMediaItem = allMediaItems.find(
        (item) =>
          item.type === "photo" &&
          (item.description?.toLowerCase().includes("wedding") ||
            item.description?.toLowerCase().includes("couple") ||
            item.description?.toLowerCase().includes("love"))
      );
      console.log("Found wedding photo:", heroMediaItem);
    }

    // Strategy 4: Just use the first photo
    if (!heroMediaItem) {
      heroMediaItem = allMediaItems.find((item) => item.type === "photo");
      console.log("Using first available photo:", heroMediaItem);
    }

    // If we found a hero photo, use it
    if (heroMediaItem && heroMediaItem.type === "photo") {
      completeEvent.heroPhoto = {
        id: heroMediaItem.id,
        url: heroMediaItem.url,
        description: heroMediaItem.description || "Hero Photo",
        eventId: DEMO_EVENT_ID,
        uploadDate: heroMediaItem.uploadDate,
      };
      console.log("Set hero photo to:", completeEvent.heroPhoto);
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {!isGalleryView && (
        <HeroSection event={completeEvent} isPhotoView={false} />
      )}

      {loading && !allMediaItems.length ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4 py-8">
          {!isGalleryView && (
            <>
              <div className="mb-12">
                <PhotoUpload eventId={DEMO_EVENT_ID} />
              </div>
              <MediaGrid
                mediaItems={allMediaItems}
                onMediaSelect={handleMediaSelect}
              />
            </>
          )}

          {isGalleryView && selectedMedia && (
            <MediaViewer
              initialMedia={selectedMedia}
              mediaItems={allMediaItems}
              onClose={handleCloseViewer}
            />
          )}
        </div>
      )}

      {loading && allMediaItems.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-white border-t-transparent"></div>
            <div className="mt-3 text-white text-sm">Loading gallery...</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppContent;

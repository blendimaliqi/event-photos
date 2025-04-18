import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { EVENT_QUERY_KEY } from "../hooks/useEvent";
import Footer from "./Footer";

const AppContent = () => {
  const [allMediaItems, setAllMediaItems] = useState<Media[]>([]);
  const [loading, setLoading] = useState(false);
  const [wasHeroDeleted, setWasHeroDeleted] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0); // Add a refresh key to trigger re-renders
  const previousHeroPhotoId = useRef<number | undefined>(undefined);
  const scrollPositionRef = useRef<number>(0); // Store scroll position
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { mediaType, mediaId } = useParams<{
    mediaType?: string;
    mediaId?: string;
  }>();

  // fetch event data to get proper hero photo info
  const { data: eventData, isLoading: eventLoading } = useQuery({
    queryKey: EVENT_QUERY_KEY.event(DEMO_EVENT_ID),
    queryFn: async () => {
      try {
        const data = await eventService.getEvent(DEMO_EVENT_ID);

        // Check if hero photo was deleted
        if (previousHeroPhotoId.current && !data.heroPhotoId) {
          setWasHeroDeleted(true);
        }

        // update our ref to track changes in heroPhotoId
        previousHeroPhotoId.current = data.heroPhotoId;

        return data;
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

  // Use a callback function for fetching media that can be reused
  const fetchAllMedia = useCallback(async () => {
    setLoading(true);
    try {
      const [photos, videos] = await Promise.all([
        photoService.getPhotos(DEMO_EVENT_ID),
        videoService.getVideos(DEMO_EVENT_ID),
      ]);

      // convert to common Media type
      const photoMedia = photos.map(photoToMedia);
      const videoMedia = videos.map(videoToMedia);

      // combine and sort by upload date (newest first)
      const allMedia = [...photoMedia, ...videoMedia].sort(
        (a, b) =>
          new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()
      );

      setAllMediaItems(allMedia);
    } catch (error) {
      console.error("Failed to load all media:", error);
    } finally {
      setLoading(false);
    }
  }, [eventData, wasHeroDeleted, queryClient]);

  // grab all media on component mount and when refreshKey changes
  useEffect(() => {
    fetchAllMedia();
  }, [fetchAllMedia, refreshKey]);

  // Handle media selection - navigate to the proper URL
  const handleMediaSelect = (media: Media) => {
    // save current scroll position before navigating
    scrollPositionRef.current = window.scrollY;
    navigate(`/${media.type}/${media.id}`);
  };

  // Handle gallery close - return to main view
  const handleCloseViewer = () => {
    navigate("/");
    // restore scroll position after navigation completes
    setTimeout(() => {
      window.scrollTo({
        top: scrollPositionRef.current,
        behavior: "auto",
      });
    }, 100);
  };

  // Callback to refresh media after successful upload
  const handleMediaUploadSuccess = useCallback(() => {
    // This will trigger a re-render and re-fetch of media
    setRefreshKey((prev) => prev + 1);
  }, []);

  // Find the currently selected media item
  const selectedMedia =
    mediaType && mediaId
      ? allMediaItems.find(
          (item) => item.type === mediaType && item.id === Number(mediaId)
        )
      : undefined;

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

  // In display mode only - if there's no hero photo from the event data but we have media items,
  // temporarily use one just for display purposes but don't save it
  let tempHeroForDisplay = completeEvent.heroPhoto;

  // Create display event that might have a temporary hero photo
  const displayEvent: Event = {
    ...completeEvent,
    heroPhoto: tempHeroForDisplay,
  };

  // Filter out hero photo from the media grid
  const filteredMediaItems = allMediaItems.filter((item) => {
    // When hero was deleted, don't filter any photos - show all in grid
    if (wasHeroDeleted) return true;

    // Only filter out the official hero photo, never the temporary one
    // 1. It's a photo AND
    // 2. Its ID matches the event's heroPhotoId (official)
    return !(
      item.type === "photo" &&
      completeEvent.heroPhotoId &&
      item.id === completeEvent.heroPhotoId
    );
  });

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      {!isGalleryView && (
        <HeroSection event={displayEvent} isPhotoView={false} />
      )}
      <div className="flex-grow">
        {isGalleryView ? (
          <MediaViewer
            initialMedia={selectedMedia!}
            mediaItems={allMediaItems}
            onClose={handleCloseViewer}
          />
        ) : (
          <div className="max-w-7xl mx-auto px-4 py-8">
            {(loading || eventLoading) && !allMediaItems.length ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <>
                <div className="mb-12">
                  <PhotoUpload
                    eventId={DEMO_EVENT_ID}
                    onUploadSuccess={handleMediaUploadSuccess}
                  />
                </div>
                <MediaGrid
                  mediaItems={filteredMediaItems}
                  onMediaSelect={handleMediaSelect}
                  isLoading={loading}
                />
              </>
            )}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default AppContent;

import React, { useState, useEffect, useRef } from "react";
import ImageGallery from "react-image-gallery";
import type { ReactImageGalleryItem } from "react-image-gallery";
import "react-image-gallery/styles/css/image-gallery.css";
import { Media } from "../types/media";
import { convertToGalleryItems, GalleryItem } from "../utils/galleryUtils";
import "./ImageGalleryComponent.css"; // We'll create this file for custom styling

interface ImageGalleryComponentProps {
  mediaItems: Media[];
  startIndex?: number;
  onClose?: () => void;
  onSlide?: (currentIndex: number) => void;
}

/**
 * Component using react-image-gallery library to display photos and videos
 */
export const ImageGalleryComponent: React.FC<ImageGalleryComponentProps> = ({
  mediaItems,
  startIndex = 0,
  onClose,
  onSlide,
}) => {
  const [items, setItems] = useState<ReactImageGalleryItem[]>([]);
  const galleryRef = useRef<ImageGallery | null>(null);
  const videoRefs = useRef<{ [key: number]: HTMLVideoElement | null }>({});
  const [currentIndex, setCurrentIndex] = useState(startIndex);

  // Convert media items to gallery format
  useEffect(() => {
    const galleryItems = convertToGalleryItems(mediaItems);

    // Convert our custom format to ReactImageGalleryItem format
    const reactGalleryItems = galleryItems.map(
      (item: GalleryItem, index: number) => {
        const galleryItem: ReactImageGalleryItem = {
          original: item.original,
          thumbnail: item.thumbnail,
          description: item.description,
          originalAlt: item.originalAlt,
          thumbnailAlt: item.thumbnailAlt,
          originalHeight: item.originalHeight,
          originalWidth: item.originalWidth,
          thumbnailHeight: item.thumbnailHeight,
          thumbnailWidth: item.thumbnailWidth,
          loading: item.loading,
          bulletClass: item.bulletClass,
          // Store isVideo and videoUrl in renderItem data
          renderItem: item.isVideo ? () => renderVideo(item, index) : undefined,
        };

        return galleryItem;
      }
    );

    setItems(reactGalleryItems);
  }, [mediaItems]);

  // Custom renderer for video items
  const renderVideo = (item: GalleryItem, index: number) => {
    if (!item.isVideo || !item.videoUrl) {
      return null;
    }

    return (
      <div className="image-gallery-video-wrapper">
        <video
          ref={(el) => (videoRefs.current[index] = el)}
          className="image-gallery-video"
          src={item.videoUrl}
          controls
          playsInline
          poster={item.videoThumbnail}
          preload="metadata"
          onClick={(e) => e.stopPropagation()} // Prevent gallery navigation when clicking video
        >
          <source src={item.videoUrl} type="video/mp4" />
          Your browser does not support HTML video.
        </video>
      </div>
    );
  };

  const handleSlide = (index: number) => {
    setCurrentIndex(index);
    onSlide?.(index);

    // Pause all videos when sliding
    Object.values(videoRefs.current).forEach((videoEl) => {
      if (videoEl && !videoEl.paused) {
        videoEl.pause();
      }
    });
  };

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape":
          onClose?.();
          break;
        case "ArrowLeft":
          galleryRef.current?.slideToIndex(
            currentIndex > 0 ? currentIndex - 1 : items.length - 1
          );
          break;
        case "ArrowRight":
          galleryRef.current?.slideToIndex(
            currentIndex < items.length - 1 ? currentIndex + 1 : 0
          );
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, currentIndex, items.length]);

  if (items.length === 0) {
    return <div className="gallery-loading">Loading media...</div>;
  }

  return (
    <div className="image-gallery-container">
      {onClose && (
        <button onClick={onClose} className="gallery-close-button">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            width="24"
            height="24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}

      <ImageGallery
        ref={galleryRef}
        items={items}
        showPlayButton={false}
        showBullets={true}
        showFullscreenButton={false}
        startIndex={startIndex}
        onSlide={handleSlide}
        useBrowserFullscreen={false}
        showIndex={true}
        showThumbnails={true}
        lazyLoad={true}
        slideDuration={200}
        slideInterval={3000}
        swipeThreshold={10}
        swipingTransitionDuration={200}
        thumbnailPosition="bottom"
      />

      <div className="gallery-counter">
        {currentIndex + 1} / {items.length}
      </div>
    </div>
  );
};

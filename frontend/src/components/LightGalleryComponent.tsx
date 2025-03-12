import React, { useEffect, useRef } from "react";
import LightGallery from "lightgallery/react";
import lgThumbnail from "lightgallery/plugins/thumbnail";
import lgZoom from "lightgallery/plugins/zoom";
import lgVideo from "lightgallery/plugins/video";

// Import styles
import "lightgallery/css/lightgallery.css";
import "lightgallery/css/lg-zoom.css";
import "lightgallery/css/lg-thumbnail.css";
import "lightgallery/css/lg-video.css";
import "./LightGalleryComponent.css";

import { Media } from "../types/media";
import { config } from "../config/config";

interface LightGalleryComponentProps {
  mediaItems: Media[];
  startIndex?: number;
  onClose?: () => void;
  onSlide?: (currentIndex: number) => void;
  thumbnailsEnabled?: boolean;
}

/**
 * Component using LightGallery library to display photos and videos
 */
export const LightGalleryComponent: React.FC<LightGalleryComponentProps> = ({
  mediaItems,
  startIndex = 0,
  onClose,
  onSlide,
  thumbnailsEnabled = true,
}) => {
  const lightGalleryRef = useRef<any>(null);

  console.log("LightGalleryComponent rendering with startIndex:", startIndex);

  // Prepare the dynamic elements for the gallery
  const dynamicElements = mediaItems.map((media, idx) => {
    const url = config.getImageUrl(media.url);
    const thumbnailUrl = media.thumbnailUrl
      ? config.getImageUrl(media.thumbnailUrl)
      : media.type === "video"
      ? config.getVideoThumbnailUrl(media.url)
      : url;

    if (media.type === "video") {
      return {
        src: url,
        thumb: thumbnailUrl,
        subHtml: media.description
          ? `<h4>${media.description}</h4>`
          : undefined,
        video: {
          source: [
            {
              src: url,
              type: "video/mp4",
            },
          ],
          attributes: {
            preload: "metadata",
            controls: true,
            autoplay: false,
            muted: false,
            playsinline: true,
          },
        },
      };
    } else {
      return {
        src: url,
        thumb: thumbnailUrl,
        subHtml: media.description
          ? `<h4>${media.description}</h4>`
          : undefined,
      };
    }
  });

  // Notify that navigation is complete and open gallery
  useEffect(() => {
    window.dispatchEvent(new Event("navigationEnd"));

    // Open gallery after a short delay to ensure DOM is ready
    const timer = setTimeout(() => {
      if (lightGalleryRef.current) {
        try {
          console.log("Opening gallery to index:", startIndex);
          lightGalleryRef.current.openGallery(startIndex);
        } catch (e) {
          console.error("Error opening gallery:", e);
        }
      }
    }, 100);

    // Clean up on unmount
    return () => {
      clearTimeout(timer);
      if (lightGalleryRef.current) {
        try {
          lightGalleryRef.current.destroy();
        } catch (e) {
          console.error("Failed to destroy lightGallery instance:", e);
        }
      }
    };
  }, [startIndex]);

  // Handle after slide event to report current index
  const handleAfterSlide = (e: any) => {
    if (onSlide && typeof e.detail.index === "number") {
      onSlide(e.detail.index);
    }
  };

  // Handle close events
  const handleClose = () => {
    onClose?.();
  };

  return (
    <div className="light-gallery-container fixed inset-0 z-[999]">
      <LightGallery
        onInit={(detail) => {
          lightGalleryRef.current = detail.instance;
          console.log("LightGallery initialized");
        }}
        plugins={[lgThumbnail, lgZoom, lgVideo]}
        dynamic={true}
        dynamicEl={dynamicElements as any}
        closable={true}
        showCloseIcon={true}
        download={false}
        counter={true}
        mobileSettings={{
          controls: true,
          showCloseIcon: true,
          download: false,
        }}
        speed={300}
        loop={true}
        thumbnail={thumbnailsEnabled}
        addClass="light-gallery-custom"
        hideScrollbar={true}
        enableSwipe={true}
        enableDrag={true}
        onAfterSlide={handleAfterSlide}
        onBeforeClose={() => handleClose()}
        // Video settings
        videojs={true}
        videojsOptions={{
          muted: false,
          controls: true,
          autoplay: false,
        }}
      />
    </div>
  );
};

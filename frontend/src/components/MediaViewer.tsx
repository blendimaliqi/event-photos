import { useEffect } from "react";
import { Media } from "../types/media";
import { config } from "../config/config";

// Import lightgallery
import LightGallery from "lightgallery/react";
import "lightgallery/css/lightgallery.css";
import "lightgallery/css/lg-zoom.css";
import "lightgallery/css/lg-thumbnail.css";
import "lightgallery/css/lg-video.css";

// Import lightgallery plugins
import lgThumbnail from "lightgallery/plugins/thumbnail";
import lgZoom from "lightgallery/plugins/zoom";
import lgVideo from "lightgallery/plugins/video";

// Loading spinner component
const LoadingSpinner = () => (
  <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin" />
  </div>
);

interface MediaViewerProps {
  mediaItems: Media[];
  initialMediaIndex: number;
  onClose: () => void;
  onNavigate?: (mediaId: number) => void;
}

export const MediaViewer = ({
  mediaItems,
  initialMediaIndex,
  onClose,
  onNavigate,
}: MediaViewerProps) => {
  // Handle slide change
  const handleSlideChange = (detail: { index: number }) => {
    const { index } = detail;
    if (index >= 0 && index < mediaItems.length && onNavigate) {
      const mediaId = mediaItems[index].id;
      onNavigate(mediaId);
    }
  };

  // Auto-open gallery when component mounts
  useEffect(() => {
    // Use setTimeout to ensure the component is fully rendered
    const timer = setTimeout(() => {
      // Find and click the gallery item that should be shown first
      const galleryItems = document.querySelectorAll(".lg-gallery-item");
      if (galleryItems.length > initialMediaIndex) {
        (galleryItems[initialMediaIndex] as HTMLElement)?.click();
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [initialMediaIndex]);

  // Add body class when gallery is open
  useEffect(() => {
    document.body.classList.add("lg-open");

    return () => {
      document.body.classList.remove("lg-open");
    };
  }, []);

  // Handle gallery close
  const handleClose = () => {
    // When lightgallery is closed, we call the onClose prop
    setTimeout(() => {
      onClose();
    }, 100);
  };

  return (
    <div className="media-viewer">
      <LightGallery
        elementClassNames="hidden"
        plugins={[lgThumbnail, lgZoom, lgVideo]}
        closable={true}
        escKey={true}
        onAfterSlide={handleSlideChange}
        onBeforeClose={handleClose}
        controls={true}
        counter={true}
        download={false}
        videojsOptions={{
          muted: false,
          controls: true,
        }}
        mobileSettings={{
          controls: true,
          showCloseIcon: true,
        }}
      >
        {mediaItems.map((item, index) => {
          const mediaUrl = config.getImageUrl(item.url);
          const thumbnailUrl = item.thumbnailUrl
            ? config.getImageUrl(item.thumbnailUrl)
            : mediaUrl;

          if (item.type === "video") {
            // Use full viewport dimensions for videos
            return (
              <a
                key={item.id}
                className="lg-gallery-item"
                data-lg-size="1920-1080"
                data-video={`{
                  "source": [{"src": "${mediaUrl}", "type": "video/mp4"}],
                  "attributes": {
                    "preload": "none",
                    "controls": true,
                    "playsinline": true,
                    "autoplay": false,
                    "muted": false,
                    "class": "lg-video-object lg-html5 video-js",
                    "style": "width: 100%; height: 100%; max-height: 100vh; max-width: 100vw; object-fit: contain;"
                  }
                }`}
                data-poster={thumbnailUrl}
                data-sub-html={`<div class="lg-sub-html"><h4>${new Date(
                  item.uploadDate
                ).toLocaleString()}</h4><p>${item.description || ""}</p></div>`}
              >
                <img
                  src={thumbnailUrl}
                  className="img-responsive"
                  alt={item.description || `Video ${index + 1}`}
                />
              </a>
            );
          } else {
            return (
              <a
                key={item.id}
                className="lg-gallery-item"
                data-src={mediaUrl}
                data-sub-html={`<div class="lg-sub-html"><h4>${new Date(
                  item.uploadDate
                ).toLocaleString()}</h4><p>${item.description || ""}</p></div>`}
              >
                <img
                  src={thumbnailUrl}
                  className="img-responsive"
                  alt={item.description || `Photo ${index + 1}`}
                />
              </a>
            );
          }
        })}
      </LightGallery>

      {/* Fallback if automatic click doesn't work */}
      <div
        className="fixed inset-0 z-50 bg-black flex items-center justify-center cursor-pointer"
        onClick={() => {
          const galleryItems = document.querySelectorAll(".lg-gallery-item");
          if (galleryItems.length > initialMediaIndex) {
            (galleryItems[initialMediaIndex] as HTMLElement)?.click();
          }
        }}
      >
        <LoadingSpinner />
      </div>

      {/* Add custom CSS to control video sizing */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
          .lg-video-cont {
            width: 100% !important;
            height: 100% !important;
            max-width: 100vw !important;
            max-height: 100vh !important;
            padding: 0 !important;
          }
          .lg-video {
            width: 100% !important;
            height: 100% !important;
            max-width: 100vw !important;
            max-height: 100vh !important;
            object-fit: contain !important;
          }
          video.lg-video-object {
            width: 100% !important;
            height: 100% !important;
            max-width: 100vw !important;
            max-height: 90vh !important;
            object-fit: contain !important;
          }
        `,
        }}
      />
    </div>
  );
};

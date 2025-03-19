import { useCallback, useEffect, useState } from "react";
import { Media } from "../types/media";
import { config } from "../config/config";

// Add type declaration for our global function
declare global {
  interface Window {
    toggleLgDescription?: () => void;
    lgPreinitialized?: boolean;
  }
}

// Import lightgallery
import LightGallery from "lightgallery/react";
import "lightgallery/css/lightgallery.css";
import "lightgallery/css/lg-zoom.css";
import "lightgallery/css/lg-video.css";

// Import lightgallery plugins
import lgZoom from "lightgallery/plugins/zoom";
import lgVideo from "lightgallery/plugins/video";

// Loading spinner component
const LoadingSpinner = () => (
  <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin" />
  </div>
);

// Preload LightGallery plugins only once
const preloadPlugins = () => {
  if (window.lgPreinitialized) return;
  window.lgPreinitialized = true;
};

// Minimal CSS embedded to avoid dynamic CSS injection overhead
const ESSENTIAL_CSS = `
.lg-comment-button {position:fixed;bottom:25px;right:25px;z-index:1090;width:50px;height:50px;background-color:rgba(231,76,60,0.85);border-radius:50%;display:flex;align-items:center;justify-content:center;color:white;border:2px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3)}
.lg-description-hidden{display:none!important}
.lg-sub-html{max-height:30vh!important;overflow-y:auto!important}
.lg-video-cont{width:100%;height:100%;max-width:100vw;max-height:100vh;padding:0}
video.lg-video-object{width:100%;height:100%;max-width:100vw;max-height:90vh;object-fit:contain;z-index:1000}
.lg-video-play-button,.lg-poster{display:none!important;opacity:0!important;visibility:hidden!important}
`;

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
  // Add state to track comment visibility
  const [commentsVisible, setCommentsVisible] = useState(true);
  // Add state to track if we're on a mobile device
  const [isMobile, setIsMobile] = useState(false);

  // Check for mobile device on component mount - only once
  useEffect(() => {
    preloadPlugins(); // Call once

    const isMobileDevice =
      window.innerWidth < 768 ||
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
    setIsMobile(isMobileDevice);

    // Add essential styles once
    if (!document.getElementById("lg-essential-styles")) {
      const styleEl = document.createElement("style");
      styleEl.id = "lg-essential-styles";
      styleEl.innerHTML = ESSENTIAL_CSS;
      document.head.appendChild(styleEl);
    }

    // Allow interaction even while gallery is still initializing
    document.body.classList.add("lg-open");

    return () => {
      // Clean up when component unmounts
      document.body.classList.remove("lg-open");
      window.toggleLgDescription = undefined;
    };
  }, []);

  // Combine slide handlers to reduce function creation
  const handleSlide = useCallback(
    (action: "before" | "after", detail?: { index: number }) => {
      // For 'before' action - pause videos
      if (action === "before") {
        const videos = document.querySelectorAll("video");
        videos.forEach((v) => (v as HTMLVideoElement).pause());
        return;
      }

      // For 'after' action with index
      if (action === "after" && detail) {
        const { index } = detail;

        // Simple DOM operations for mobile
        const currentSlide = document.querySelector(".lg-current");
        if (currentSlide) {
          const video = currentSlide.querySelector("video") as HTMLVideoElement;
          if (video) {
            video.controls = true;
            video.style.visibility = "visible";
            video.style.opacity = "1";
          }
        }

        // Handle navigation
        if (index >= 0 && index < mediaItems.length && onNavigate) {
          onNavigate(mediaItems[index].id);
        }
      }
    },
    [mediaItems, onNavigate]
  );

  // Handle close with cleanup
  const handleClose = useCallback(() => {
    // Basic cleanup - avoid expensive operations
    document.body.classList.remove("lg-open");
    window.toggleLgDescription = undefined;

    // Call the onClose handler
    onClose();
  }, [onClose]);

  // Auto-open gallery when component mounts - use a shorter timeout
  useEffect(() => {
    // Faster initialization for mobile
    const timer = setTimeout(
      () => {
        const galleryItems = document.querySelectorAll(".lg-gallery-item");
        if (galleryItems.length > initialMediaIndex) {
          (galleryItems[initialMediaIndex] as HTMLElement)?.click();
        }
      },
      isMobile ? 20 : 50
    );

    return () => clearTimeout(timer);
  }, [initialMediaIndex, isMobile]);

  // Setup toggle description function
  useEffect(() => {
    // Function to toggle comment visibility
    window.toggleLgDescription = () => {
      setCommentsVisible((prev) => !prev);
      const subHtmlEl = document.querySelector(".lg-sub-html");
      if (subHtmlEl) {
        if (commentsVisible) {
          subHtmlEl.classList.add("lg-description-hidden");
        } else {
          subHtmlEl.classList.remove("lg-description-hidden");
        }
      }
    };

    return () => {
      window.toggleLgDescription = undefined;
    };
  }, [commentsVisible]);

  // Optimize for mobile by reducing props and simplifying gallery structure
  return (
    <div className="media-viewer">
      <LightGallery
        elementClassNames="hidden"
        plugins={[lgZoom, lgVideo]}
        closable={true}
        escKey={true}
        onAfterSlide={(detail) => handleSlide("after", detail)}
        onBeforeSlide={() => handleSlide("before")}
        onBeforeClose={handleClose}
        controls={true}
        counter={true}
        download={false}
        thumbnail={false}
        videojsOptions={{
          muted: false,
          controls: true,
          preload: "metadata", // Always use metadata for faster loading
          autoplay: false,
          controlBar: {
            pictureInPictureToggle: false,
          },
        }}
        videojs={false}
        autoplayFirstVideo={false}
        autoplayVideoOnSlide={false} // Always disable autoplay for videos
        gotoNextSlideOnVideoEnd={false}
        hideControlOnEnd={false}
        addClass="lg-video-poster-fix lg-prevent-duplicate"
        mobileSettings={{
          controls: true,
          showCloseIcon: true,
          download: false,
          rotate: false,
        }}
        speed={150} // Even faster transitions to improve perceived performance
      >
        {mediaItems.map((item, index) => {
          const mediaUrl = config.getImageUrl(item.url);
          const thumbnailUrl = item.thumbnailUrl
            ? config.getImageUrl(item.thumbnailUrl)
            : mediaUrl;

          // Simplified gallery item generation
          if (item.type === "video") {
            return (
              <a
                key={item.id}
                className="lg-gallery-item lg-video-item"
                data-lg-size="1280-720" // Smaller size for better mobile performance
                data-video={`{
                  "source": [{"src": "${mediaUrl}", "type": "video/mp4"}],
                  "attributes": {
                    "preload": "metadata", 
                    "controls": true,
                    "playsinline": true,
                    "autoplay": false,
                    "muted": false
                  }
                }`}
                data-sub-html={`<div>${new Date(
                  item.uploadDate
                ).toLocaleString()}</div>${
                  item.description ? `<p>${item.description}</p>` : ""
                }`}
              >
                <img
                  src={thumbnailUrl}
                  alt={item.description || `Video ${index + 1}`}
                  loading="lazy"
                />
              </a>
            );
          }

          return (
            <a
              key={item.id}
              className="lg-gallery-item"
              data-src={mediaUrl}
              data-sub-html={`<div>${new Date(
                item.uploadDate
              ).toLocaleString()}</div>${
                item.description ? `<p>${item.description}</p>` : ""
              }`}
            >
              <img
                src={thumbnailUrl}
                alt={item.description || `Photo ${index + 1}`}
                loading="eager" // Load immediately for visible items
              />
            </a>
          );
        })}
      </LightGallery>

      {/* Simplified fallback loading indicator */}
      <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
        <LoadingSpinner />
      </div>
    </div>
  );
};

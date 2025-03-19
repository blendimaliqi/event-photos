import { useCallback, useEffect, useState } from "react";
import { Media } from "../types/media";
import { config } from "../config/config";

// Add type declaration for our global function
declare global {
  interface Window {
    toggleLgDescription?: () => void;
    lgPreinitialized?: boolean;
    lgInitTime?: number;
    debugLG?: (msg: string) => void;
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

// Optimize loading performance by using inline SVG for video thumbnails
const VIDEO_THUMBNAIL = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 100 100"><rect width="100%" height="100%" fill="%23374151"/></svg>`;

// Less verbose debug helper
const initDebug = () => {
  window.lgInitTime = Date.now();
  window.debugLG = (msg) => {
    const timeElapsed = Date.now() - (window.lgInitTime || 0);
    if (import.meta.env.DEV) {
      console.log(`[LG-DEBUG] ${timeElapsed}ms: ${msg}`);
    }
  };
  window.debugLG("Debug initialized");
};

// Skip preloading entirely on mobile
const preloadPlugins = () => {
  // Already initialized
  if (window.lgPreinitialized) return;

  // Check if mobile and skip initialization if so
  const isMobile =
    window.innerWidth < 768 ||
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );

  if (isMobile) {
    window.lgPreinitialized = true;
    return;
  }

  // Only preload for desktop
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
  const [commentsVisible, setCommentsVisible] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Move these expensive operations to a useEffect with empty dependency array
  useEffect(() => {
    // Initialize debug only in development
    if (!window.debugLG && import.meta.env.DEV) {
      initDebug();
    }

    // Detect mobile once
    const isMobileDevice =
      window.innerWidth < 768 ||
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
    setIsMobile(isMobileDevice);

    // Only preload plugins on desktop
    if (!isMobileDevice) {
      preloadPlugins();
    }

    // Add essential styles only once and only if not already added
    if (!document.getElementById("lg-essential-styles")) {
      const styleEl = document.createElement("style");
      styleEl.id = "lg-essential-styles";
      styleEl.innerHTML = ESSENTIAL_CSS;
      document.head.appendChild(styleEl);
    }

    // Clean up when component unmounts
    return () => {
      document.body.classList.remove("lg-open");
      window.toggleLgDescription = undefined;
    };
  }, []);

  // Combine slide handlers to reduce function creation
  const handleSlide = useCallback(
    (action: "before" | "after", detail?: { index: number }) => {
      window.debugLG?.(`Slide ${action} handler called ${detail?.index}`);

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
          window.debugLG?.("Setting up current slide");
          const video = currentSlide.querySelector("video") as HTMLVideoElement;
          if (video) {
            window.debugLG?.("Setting up video controls");
            video.controls = true;
            video.style.visibility = "visible";
            video.style.opacity = "1";
          }
        }

        // Handle navigation
        if (index >= 0 && index < mediaItems.length && onNavigate) {
          window.debugLG?.(`Navigating to item ${index}`);
          onNavigate(mediaItems[index].id);
        }
      }
    },
    [mediaItems, onNavigate]
  );

  // Handle close with cleanup
  const handleClose = useCallback(() => {
    window.debugLG?.("Close handler called");
    // Basic cleanup - avoid expensive operations
    document.body.classList.remove("lg-open");
    window.toggleLgDescription = undefined;

    // Call the onClose handler
    onClose();
  }, [onClose]);

  // Auto-open gallery when component mounts
  useEffect(() => {
    // Use a very short timeout for mobile
    const timer = setTimeout(
      () => {
        const galleryItems = document.querySelectorAll(".lg-gallery-item");

        if (galleryItems.length > initialMediaIndex) {
          try {
            (galleryItems[initialMediaIndex] as HTMLElement)?.click();
          } catch (err) {
            console.error("Gallery initialization error:", err);
          }
        }
      },
      isMobile ? 10 : 30
    );

    return () => clearTimeout(timer);
  }, [initialMediaIndex, isMobile]);

  // Setup toggle description function
  useEffect(() => {
    window.debugLG?.("Setting up toggle description function");
    // Function to toggle comment visibility
    window.toggleLgDescription = () => {
      window.debugLG?.("Toggle description called");
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

  window.debugLG?.("Rendering MediaViewer");

  // Optimize rendering for mobile
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
        preload={1}
        videojsOptions={{
          muted: false,
          controls: true,
          preload: "none", // Changed from metadata to none for faster loading
          autoplay: false,
        }}
        videojs={false}
        autoplayFirstVideo={false}
        autoplayVideoOnSlide={false}
        gotoNextSlideOnVideoEnd={false}
        hideControlOnEnd={false}
        addClass="lg-video-poster-fix lg-prevent-duplicate"
        mobileSettings={{
          controls: true,
          showCloseIcon: true,
          download: false,
          rotate: false,
        }}
        speed={100} // Even faster transitions
        licenseKey="non-commercial-version"
        mode="lg-fade"
      >
        {mediaItems.map((item, index) => {
          const mediaUrl = config.getImageUrl(item.url);
          const thumbnailUrl = item.thumbnailUrl
            ? config.getImageUrl(item.thumbnailUrl)
            : item.type === "video"
            ? VIDEO_THUMBNAIL
            : mediaUrl;

          if (item.type === "video") {
            return (
              <a
                key={item.id}
                className="lg-gallery-item lg-video-item"
                data-lg-size="1280-720"
                data-video={`{
                  "source": [{"src": "${mediaUrl}", "type": "video/mp4"}],
                  "attributes": {
                    "preload": "none", 
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
                  src={VIDEO_THUMBNAIL}
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
                loading={index < 3 ? "eager" : "lazy"}
                width="150"
                height="150"
              />
            </a>
          );
        })}
      </LightGallery>

      {/* Simple loading indicator */}
      <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin" />
      </div>
    </div>
  );
};

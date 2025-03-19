import { useCallback, useEffect, useState } from "react";
import { Media } from "../types/media";
import { config } from "../config/config";

// Add type declaration for our global function
declare global {
  interface Window {
    toggleLgDescription?: () => void;
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

  // Check for mobile device on component mount - do this immediately
  useEffect(() => {
    // Simple mobile detection
    const isMobileDevice =
      window.innerWidth < 768 ||
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
    setIsMobile(isMobileDevice);

    const checkResize = () => {
      setIsMobile(
        window.innerWidth < 768 ||
          /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
            navigator.userAgent
          )
      );
    };

    window.addEventListener("resize", checkResize);
    return () => window.removeEventListener("resize", checkResize);
  }, []);

  // Handle before slide change - more gentle handling
  const handleBeforeSlide = useCallback(() => {
    // Just pause videos, don't remove sources or reset time
    // This prevents the black screen when returning to videos
    const videos = document.querySelectorAll("video");
    videos.forEach((video) => {
      const videoElement = video as HTMLVideoElement;
      videoElement.pause();
    });
  }, []);

  // Optimize cleanup function to be less aggressive
  const cleanupBackgroundVideos = useCallback(() => {
    // On mobile, only do essential cleanup to avoid performance issues
    if (isMobile) {
      const videos = document.querySelectorAll("video:not([controls])");
      videos.forEach((video) => {
        (video as HTMLVideoElement).pause();
      });
      return;
    }

    // On desktop, do more thorough cleanup
    // Find all preview videos and remove them
    const previewVideos = document.querySelectorAll(
      ".lg-video-object:not([controls])"
    );

    if (previewVideos.length === 0) return; // Skip if nothing to clean

    previewVideos.forEach((video) => {
      if (video.parentElement) {
        video.parentElement.removeChild(video);
      }
    });

    // Find all poster elements and hide them
    const posterElements = document.querySelectorAll(".lg-poster");
    posterElements.forEach((poster) => {
      if (poster.parentElement) {
        const posterEl = poster as HTMLElement;
        posterEl.style.display = "none";
      }
    });
  }, [isMobile]);

  // Handle after slide - initialize video properly
  const handleAfterSlide = useCallback(
    (detail: { index: number }) => {
      const { index } = detail;

      // Find the current slide and ensure video controls are shown
      setTimeout(
        () => {
          // Clean up any background videos
          cleanupBackgroundVideos();

          const currentSlide = document.querySelector(".lg-current");
          if (!currentSlide) return;

          // Check if it's a video slide
          const videoElement = currentSlide.querySelector("video");
          if (videoElement) {
            // Force reload and show controls
            const video = videoElement as HTMLVideoElement;
            video.controls = true;

            // Make sure the video is visible and properly positioned
            video.style.visibility = "visible";
            video.style.opacity = "1";
            video.style.zIndex = "1000";

            // Only attempt autoplay on desktop, not mobile
            if (!isMobile) {
              try {
                video.play().catch(() => {
                  // Silent catch for autoplay restrictions
                });
              } catch (e) {
                // Silent catch
              }
            }
          }
        },
        isMobile ? 100 : 50
      ); // Give more time on mobile

      // Also handle routing
      if (index >= 0 && index < mediaItems.length && onNavigate) {
        const mediaId = mediaItems[index].id;
        onNavigate(mediaId);
      }
    },
    [cleanupBackgroundVideos, isMobile, mediaItems, onNavigate]
  );

  // Handle close with cleanup
  const handleClose = useCallback(() => {
    // Clean up any event listeners or elements
    document.body.classList.remove("lg-open");
    window.toggleLgDescription = undefined;

    // Clean up all video elements before closing
    const videos = document.querySelectorAll("video");
    videos.forEach((video) => {
      (video as HTMLVideoElement).pause();
      if (video.src) {
        (video as HTMLVideoElement).src = "";
        (video as HTMLVideoElement).load();
      }
    });

    // Call the onClose handler
    onClose();
  }, [onClose]);

  // Auto-open gallery when component mounts
  useEffect(() => {
    // Allow a short delay for component to render
    const timer = setTimeout(
      () => {
        // Use requestAnimationFrame to ensure DOM is ready
        requestAnimationFrame(() => {
          // Find and click the gallery item that should be shown first
          const galleryItems = document.querySelectorAll(".lg-gallery-item");
          if (galleryItems.length > initialMediaIndex) {
            (galleryItems[initialMediaIndex] as HTMLElement)?.click();
          }
        });
      },
      isMobile ? 50 : 100
    ); // Shorter delay on mobile

    return () => clearTimeout(timer);
  }, [initialMediaIndex, isMobile]);

  // Add body class when gallery is open
  useEffect(() => {
    document.body.classList.add("lg-open");

    // Function to toggle comment visibility
    function toggleCommentVisibility() {
      console.log("Toggling comment visibility");
      setCommentsVisible((prev) => !prev);

      const subHtmlEl = document.querySelector(".lg-sub-html");
      if (subHtmlEl) {
        if (commentsVisible) {
          // Currently visible, hide them
          subHtmlEl.classList.add("lg-description-hidden");
        } else {
          // Currently hidden, show them
          subHtmlEl.classList.remove("lg-description-hidden");
        }
      }
    }

    // Make this function globally available
    window.toggleLgDescription = toggleCommentVisibility;

    return () => {
      // Clean up when component unmounts
      document.body.classList.remove("lg-open");
      window.toggleLgDescription = undefined;
    };
  }, [commentsVisible]);

  return (
    <div className="media-viewer">
      <LightGallery
        elementClassNames="hidden"
        plugins={[lgZoom, lgVideo]}
        closable={true}
        escKey={true}
        onAfterSlide={handleAfterSlide}
        onBeforeSlide={handleBeforeSlide}
        onBeforeClose={handleClose}
        controls={true}
        counter={true}
        download={false}
        thumbnail={false}
        videojsOptions={{
          muted: false,
          controls: true,
          preload: isMobile ? "metadata" : "auto", // Optimize for mobile - only load metadata
          autoplay: false, // Disable autoplay by default
          controlBar: {
            pictureInPictureToggle: false,
          },
        }}
        videojs={false}
        autoplayFirstVideo={false}
        autoplayVideoOnSlide={!isMobile} // Disable auto-playing videos on slide change for mobile
        gotoNextSlideOnVideoEnd={false}
        hideControlOnEnd={false}
        addClass="lg-video-poster-fix lg-prevent-duplicate"
        mobileSettings={{
          controls: true,
          showCloseIcon: true,
          download: false,
          rotate: false, // Disable rotation on mobile for better performance
        }}
        speed={250} // Faster transitions for better performance
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
                className="lg-gallery-item lg-video-item"
                data-lg-size="1920-1080"
                data-video={`{
                  "source": [{"src": "${mediaUrl}", "type": "video/mp4"}],
                  "attributes": {
                    "preload": "${isMobile ? "metadata" : "auto"}", 
                    "controls": true,
                    "playsinline": true,
                    "autoplay": false,
                    "muted": false,
                    "id": "video-${item.id}",
                    "class": "lg-video-object lg-html5",
                    "controlsList": "nodownload",
                    "style": "width: 100%; height: 100%; max-height: 100vh; max-width: 100vw; object-fit: contain; z-index: 1000; opacity: 1;"
                  }
                }`}
                data-poster=""
                data-sub-html={`<div class="lg-sub-html-inner"><h4>${new Date(
                  item.uploadDate
                ).toLocaleString()}</h4><p>${item.description || ""}</p></div>`}
                data-has-description="${!!item.description}"
                data-loop="false"
              >
                <img
                  src={thumbnailUrl}
                  className="img-responsive"
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
              data-sub-html={`<div class="lg-sub-html-inner"><h4>${new Date(
                item.uploadDate
              ).toLocaleString()}</h4><p>${item.description || ""}</p></div>`}
              data-has-description="${!!item.description}"
            >
              <img
                src={thumbnailUrl}
                className="img-responsive"
                alt={item.description || `Photo ${index + 1}`}
              />
            </a>
          );
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

      {/* Directly rendered comment button as a backup */}
      <button
        id="fallback-comment-button"
        className="fixed bottom-[25px] right-[25px] z-[1090] w-[50px] h-[50px] bg-red-500 bg-opacity-85 rounded-full hidden items-center justify-center text-white border-2 border-white shadow-md"
        style={{ display: "none" }}
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          console.log("Backup comment button clicked");
          const subHtmlEl = document.querySelector(".lg-sub-html");
          if (subHtmlEl) {
            if (subHtmlEl.classList.contains("lg-description-hidden")) {
              subHtmlEl.classList.remove("lg-description-hidden");
            } else {
              subHtmlEl.classList.add("lg-description-hidden");
            }
          }
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="26"
          height="26"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ filter: "drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3))" }}
        >
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
        </svg>
        {mediaItems.some(
          (item) => item.description && item.description.trim() !== ""
        ) && (
          <span className="absolute -top-2 -right-2 bg-blue-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center font-bold border-2 border-white shadow-sm">
            i
          </span>
        )}
      </button>

      {/* Add custom CSS to control video sizing and fix double play button */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
          /* Comment button styles */
          .lg-comment-button {
            position: fixed;
            bottom: 25px;
            right: 25px;
            z-index: 1090;
            width: 50px;
            height: 50px;
            background-color: rgba(231, 76, 60, 0.85);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            border: 2px solid white;
            outline: none;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
          }

          .lg-comment-button:hover, 
          .lg-comment-button:active {
            background-color: rgba(231, 76, 60, 1);
            transform: scale(1.05);
          }

          .lg-comment-button svg {
            width: 26px;
            height: 26px;
            filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
          }
          
          /* Badge to indicate comments are available */
          .lg-comment-badge {
            position: absolute;
            top: -8px;
            right: -8px;
            background-color: #2980b9;
            color: white;
            border-radius: 50%;
            width: 22px;
            height: 22px;
            font-size: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            border: 2px solid white;
            box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
          }

          /* Description visibility states */
          .lg-description-hidden {
            display: none !important;
          }

          /* Styling for the description container */
          .lg-sub-html {
            bottom: 10px !important;
            padding: 10px !important;
            background-color: rgba(0, 0, 0, 0.4) !important;
            backdrop-filter: blur(4px) !important;
            border-radius: 8px !important;
            margin: 0 10px !important;
            max-width: 80% !important;
            margin: 0 auto !important;
            text-align: left !important;
            overflow-y: auto !important;
            max-height: 30vh !important;
          }

          /* Ensure subhtml content is properly styled */
          .lg-sub-html-inner {
            max-height: 30vh;
            overflow-y: auto;
            padding-right: 10px;
          }
          
          /* Custom scrollbar for descriptions */
          .lg-sub-html-inner::-webkit-scrollbar {
            width: 6px;
            background-color: rgba(0, 0, 0, 0.1);
          }
          
          .lg-sub-html-inner::-webkit-scrollbar-thumb {
            background-color: rgba(255, 255, 255, 0.3);
            border-radius: 3px;
          }
          
          .lg-sub-html-inner::-webkit-scrollbar-track {
            background-color: rgba(0, 0, 0, 0.1);
          }

          /* Video optimizations */
          .lg-video-cont {
            width: 100%;
            height: 100%;
            max-width: 100vw;
            max-height: 100vh;
            padding: 0;
          }
          
          video.lg-video-object {
            width: 100%;
            height: 100%;
            max-width: 100vw;
            max-height: 90vh;
            object-fit: contain;
            z-index: 1000;
            position: relative;
          }
          
          /* Hide the default play button */
          .lg-video-play-button {
            display: none;
            opacity: 0;
            visibility: hidden;
          }
          
          /* Fix for poster image overlapping with video */
          .lg-poster {
            display: none;
            opacity: 0;
            visibility: hidden;
          }
          
          /* Simplified video container styling */
          .lg-video-cont.lg-has-html5 video {
            display: block;
            opacity: 1;
          }
        `,
        }}
      />
    </div>
  );
};

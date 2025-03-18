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

    // Just pause videos when changing slides, but don't remove sources
    // This allows returning to them later
    const videos = document.querySelectorAll("video");
    videos.forEach((video) => {
      const videoElement = video as HTMLVideoElement;
      if (!videoElement.paused) {
        videoElement.pause();
      }
    });
  };

  // Handle before slide change - more gentle handling
  const handleBeforeSlide = () => {
    // Just pause videos, don't remove sources or reset time
    // This prevents the black screen when returning to videos
    const videos = document.querySelectorAll("video");
    videos.forEach((video) => {
      const videoElement = video as HTMLVideoElement;
      videoElement.pause();
    });
  };

  // Handle after slide - initialize video properly
  const handleAfterSlide = (detail: { index: number }) => {
    const { index } = detail;

    // Find the current slide and ensure video controls are shown
    setTimeout(() => {
      const currentSlide = document.querySelector(".lg-current");
      if (currentSlide) {
        // Check if it's a video slide
        const videoElement = currentSlide.querySelector("video");
        if (videoElement) {
          // Force reload and show controls
          const video = videoElement as HTMLVideoElement;
          video.controls = true;

          // Autoplay the video (if browser allows it)
          try {
            video.play().catch((err) => {
              console.log("Autoplay prevented by browser:", err);
              // Show play button or relevant UI when autoplay is blocked
            });
          } catch (e) {
            console.log("Error trying to autoplay:", e);
          }

          // Make sure videojs doesn't hide our controls
          const videoContainer = currentSlide.querySelector(".lg-video-cont");
          if (videoContainer) {
            videoContainer.classList.add("lg-has-html5");
          }
        }
      }
    }, 50);

    // Also handle routing
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

    // Add event listener to fix any weird video behavior
    const videoFixHandler = () => {
      // Fix video player controls if needed
      const lgOuterEl = document.querySelector(".lg-outer");
      if (lgOuterEl) {
        // Add a class to identify when gallery is ready
        lgOuterEl.classList.add("lg-custom-initialized");

        // Setup MutationObserver to handle changes in gallery slides
        const observer = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            if (
              mutation.type === "childList" ||
              mutation.type === "attributes"
            ) {
              // Find videos and ensure they have controls
              const videos = document.querySelectorAll("video.lg-video-object");
              videos.forEach((video) => {
                const videoEl = video as HTMLVideoElement;
                videoEl.controls = true;

                // Try to autoplay when video is added to DOM
                try {
                  videoEl.play().catch(() => {
                    // Silent catch - browser may block autoplay
                  });
                } catch (e) {
                  // Silent catch
                }
              });

              // Add class to video containers to ensure controls are shown
              const videoContainers =
                document.querySelectorAll(".lg-video-cont");
              videoContainers.forEach((container) => {
                container.classList.add("lg-has-html5");
              });
            }
          });
        });

        // Start observing the gallery
        observer.observe(lgOuterEl, {
          childList: true,
          subtree: true,
          attributes: true,
        });
      }
    };

    document.addEventListener("lgAfterOpen", videoFixHandler);

    return () => {
      document.body.classList.remove("lg-open");
      document.removeEventListener("lgAfterOpen", videoFixHandler);

      // Clean up any remaining videos when component unmounts
      const videos = document.querySelectorAll("video");
      videos.forEach((video) => {
        const videoElement = video as HTMLVideoElement;
        videoElement.pause();
        videoElement.src = "";
        videoElement.load();
      });
    };
  }, []);

  // Handle gallery close
  const handleClose = () => {
    // Pause any videos when closing
    const videos = document.querySelectorAll("video");
    videos.forEach((video) => {
      const videoElement = video as HTMLVideoElement;
      videoElement.pause();
    });

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
        onAfterSlide={handleAfterSlide}
        onBeforeSlide={handleBeforeSlide}
        onBeforeClose={handleClose}
        controls={true}
        counter={true}
        download={false}
        videojsOptions={{
          muted: false,
          controls: true,
          preload: "auto",
          autoplay: true,
          controlBar: {
            pictureInPictureToggle: false,
          },
        }}
        videojs={false}
        autoplayFirstVideo={true}
        autoplayVideoOnSlide={true}
        gotoNextSlideOnVideoEnd={false}
        hideControlOnEnd={false}
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
                    "preload": "auto",
                    "controls": true,
                    "playsinline": true,
                    "autoplay": true,
                    "muted": false,
                    "class": "lg-video-object lg-html5",
                    "controlsList": "nodownload",
                    "style": "width: 100%; height: 100%; max-height: 100vh; max-width: 100vw; object-fit: contain;"
                  }
                }`}
                data-poster={thumbnailUrl}
                data-sub-html={`<div class="lg-sub-html"><h4>${new Date(
                  item.uploadDate
                ).toLocaleString()}</h4><p>${item.description || ""}</p></div>`}
                data-loop="false"
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

      {/* Add custom CSS to control video sizing and fix double play button */}
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
          /* Hide the default play button to prevent double play buttons */
          .lg-video-play-button {
            display: none !important;
          }
          /* Make sure video controls are always visible */
          .lg-show-autoplay-video .lg-video-container .lg-video-play-button {
            display: none !important;
          }
          /* Fix for showing video controls immediately */
          .lg-outer .lg-video-cont.lg-has-html5 video {
            display: block !important;
            opacity: 1 !important;
          }
          /* Hide any preview overlays */
          .lg-outer .lg-item.lg-complete .lg-object {
            opacity: 1 !important;
          }
          /* Force video container to show video immediately */
          .lg-outer.lg-show-actual-size .lg-video-cont {
            overflow: visible !important;
          }
        `,
        }}
      />
    </div>
  );
};

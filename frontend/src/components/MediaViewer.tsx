import { useEffect, useState } from "react";
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

  // Remove all background/preview videos
  const cleanupBackgroundVideos = () => {
    // Find all preview videos and remove them
    const previewVideos = document.querySelectorAll(
      ".lg-video-object:not([controls])"
    );
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
        posterEl.style.opacity = "0";
        posterEl.style.display = "none";
        posterEl.style.visibility = "hidden";
      }
    });

    // Find any background video containers and clean them
    const videoContainers = document.querySelectorAll(
      ".lg-media-container > :not(.lg-video-cont)"
    );
    videoContainers.forEach((container) => {
      if (container.parentElement) {
        container.parentElement.removeChild(container);
      }
    });
  };

  // Handle after slide - initialize video properly
  const handleAfterSlide = (detail: { index: number }) => {
    const { index } = detail;

    // Find the current slide and ensure video controls are shown
    setTimeout(() => {
      // First clean up any background videos
      cleanupBackgroundVideos();

      const currentSlide = document.querySelector(".lg-current");
      if (currentSlide) {
        // Remove all extra/duplicate video elements in this slide
        const allVideoElements = currentSlide.querySelectorAll("video");
        if (allVideoElements.length > 1) {
          // Keep only the one with controls
          allVideoElements.forEach((videoEl, idx) => {
            const video = videoEl as HTMLVideoElement;
            if (!video.controls) {
              // Not the main video, remove it
              if (video.parentElement) {
                video.pause();
                video.src = "";
                video.load();
                video.parentElement.removeChild(video);
              }
            }
          });
        }

        // Check if it's a video slide
        const videoElement = currentSlide.querySelector("video");
        if (videoElement) {
          // Force reload and show controls
          const video = videoElement as HTMLVideoElement;
          video.controls = true;

          // Remove any poster or preview elements
          const posterContainers = currentSlide.querySelectorAll(
            ".lg-img-wrap, .lg-poster, .lg-video-poster"
          );
          posterContainers.forEach((container) => {
            if (container.parentElement) {
              container.parentElement.removeChild(container);
            }
          });

          // Hide the poster image when video is ready to play
          // This prevents the overlapping poster + video issue
          video.addEventListener(
            "canplay",
            () => {
              // Clean up again after video can play
              cleanupBackgroundVideos();

              // Make sure the video is visible and properly positioned
              video.style.visibility = "visible";
              video.style.opacity = "1";
              video.style.zIndex = "1000";

              // Ensure parent containers are correctly styled
              const videoContainer = video.closest(".lg-video-cont");
              if (videoContainer) {
                const containerEl = videoContainer as HTMLElement;
                containerEl.style.visibility = "visible";
                containerEl.style.opacity = "1";
                containerEl.style.zIndex = "1000";

                // Remove any background videos or poster elements
                const bgElements = videoContainer.querySelectorAll(
                  ".lg-poster, .lg-video-play-button"
                );
                bgElements.forEach((el) => {
                  if (el.parentElement) {
                    el.parentElement.removeChild(el);
                  }
                });
              }
            },
            { once: true }
          );

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

            // Remove any stray poster elements that might be causing overlap
            const posterElement = videoContainer.querySelector(".lg-poster");
            if (posterElement && posterElement.parentElement) {
              posterElement.parentElement.removeChild(posterElement);
            }
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

    // Function to add the comment button
    const addCommentButton = () => {
      console.log("Adding comment button to gallery");

      // If button already exists, don't add another one
      if (document.querySelector(".lg-comment-button")) {
        console.log("Comment button already exists");
        return;
      }

      // Create button element
      const commentBtn = document.createElement("button");
      commentBtn.className = "lg-comment-button";
      commentBtn.setAttribute("aria-label", "Toggle image comments");
      commentBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-message-circle"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>`;

      // Add a badge if descriptions exist
      const hasDescriptions = mediaItems.some(
        (item) => item.description && item.description.trim() !== ""
      );
      if (hasDescriptions) {
        const badge = document.createElement("span");
        badge.className = "lg-comment-badge";
        badge.textContent = "i";
        commentBtn.appendChild(badge);
      }

      // Add click handler
      commentBtn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log("Comment button clicked");
        toggleCommentVisibility();
      };

      // Try all possible containers to add the button
      const toolbar = document.querySelector(".lg-toolbar");
      const container = document.querySelector(".lg-container");
      const outer = document.querySelector(".lg-outer");

      console.log("Available containers:", { toolbar, container, outer });

      if (toolbar) {
        console.log("Adding button to toolbar");
        toolbar.appendChild(commentBtn);
      } else if (container) {
        console.log("Adding button to container");
        container.appendChild(commentBtn);
      } else if (outer) {
        console.log("Adding button to outer container");
        outer.appendChild(commentBtn);
      } else {
        console.log("Fallback to body for comment button");
        document.body.appendChild(commentBtn);
      }
    };

    // Add our button when gallery opens
    document.addEventListener("lgAfterOpen", () => {
      console.log("Gallery opened, adding comment button");
      // Try multiple times to ensure button is added
      setTimeout(addCommentButton, 300);
      setTimeout(addCommentButton, 800);
      setTimeout(addCommentButton, 1500);
    });

    // Also add the button when slides change
    document.addEventListener("lgAfterSlide", () => {
      setTimeout(addCommentButton, 300);
    });

    // Add event listener to fix any weird video behavior
    const videoFixHandler = () => {
      // Remove any duplicate/preview videos
      cleanupBackgroundVideos();

      // Fix video player controls if needed
      const lgOuterEl = document.querySelector(".lg-outer");
      if (lgOuterEl) {
        // Add a class to identify when gallery is ready
        lgOuterEl.classList.add("lg-custom-initialized");

        // Add class to ensure correct mode for full video container
        lgOuterEl.classList.add("lg-use-css3");
        lgOuterEl.classList.add("lg-css3");
        lgOuterEl.classList.add("lg-no-transition");

        // Setup MutationObserver to handle changes in gallery slides
        const observer = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            if (
              mutation.type === "childList" ||
              mutation.type === "attributes"
            ) {
              // Clean up any background/preview videos
              cleanupBackgroundVideos();

              // Find videos and ensure they have controls
              const videos = document.querySelectorAll("video.lg-video-object");
              videos.forEach((video) => {
                const videoEl = video as HTMLVideoElement;
                videoEl.controls = true;

                // Hide any poster elements
                const parentSlide = videoEl.closest(".lg-item");
                if (parentSlide) {
                  const posterElements =
                    parentSlide.querySelectorAll(".lg-poster");
                  posterElements.forEach((poster) => {
                    poster.classList.add("lg-poster-force-hide");
                    // Also remove it to ensure it doesn't interfere
                    if (poster.parentElement) {
                      poster.parentElement.removeChild(poster);
                    }
                  });
                }

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

                // Remove any poster elements that might be causing overlay issues
                const posterElement = container.querySelector(".lg-poster");
                if (posterElement && posterElement.parentElement) {
                  const posterEl = posterElement as HTMLElement;
                  posterEl.style.display = "none";
                  // Add null check before attempting to remove child
                  if (posterEl.parentElement) {
                    posterEl.parentElement.removeChild(posterEl);
                  }
                }
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

    // Monitor for any changes and cleanup background videos regularly
    const videoCleanupInterval = setInterval(cleanupBackgroundVideos, 500);

    return () => {
      document.body.classList.remove("lg-open");
      document.removeEventListener("lgAfterOpen", videoFixHandler);
      document.removeEventListener("lgAfterOpen", addCommentButton);
      document.removeEventListener("lgAfterSlide", addCommentButton);
      window.toggleLgDescription = undefined;
      clearInterval(videoCleanupInterval);

      // Remove any comment buttons that might have been added
      const commentBtn = document.querySelector(".lg-comment-button");
      if (commentBtn && commentBtn.parentElement) {
        commentBtn.parentElement.removeChild(commentBtn);
      }

      // Clean up any remaining videos when component unmounts
      const videos = document.querySelectorAll("video");
      videos.forEach((video) => {
        const videoElement = video as HTMLVideoElement;
        videoElement.pause();
        videoElement.src = "";
        videoElement.load();
      });
    };
  }, [mediaItems, commentsVisible]);

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
          preload: "auto",
          autoplay: true,
          controlBar: {
            pictureInPictureToggle: false,
          },
        }}
        videojs={false}
        autoplayFirstVideo={false}
        autoplayVideoOnSlide={true}
        gotoNextSlideOnVideoEnd={false}
        hideControlOnEnd={false}
        addClass="lg-video-poster-fix lg-prevent-duplicate"
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
                className="lg-gallery-item lg-video-item"
                data-lg-size="1920-1080"
                data-video={`{
                  "source": [{"src": "${mediaUrl}", "type": "video/mp4"}],
                  "attributes": {
                    "preload": "auto",
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
                />
              </a>
            );
          } else {
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
            z-index: 1000 !important;
            position: relative !important;
          }
          /* Hide the default play button to prevent double play buttons */
          .lg-video-play-button {
            display: none !important;
            opacity: 0 !important;
            visibility: hidden !important;
          }
          /* Make sure video controls are always visible */
          .lg-show-autoplay-video .lg-video-container .lg-video-play-button {
            display: none !important;
            opacity: 0 !important;
            visibility: hidden !important;
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
          /* Fix for poster image overlapping with video */
          .lg-poster {
            display: none !important;
            opacity: 0 !important;
            visibility: hidden !important;
          }
          /* Hide any background preview videos */
          .lg-video-object:not([controls]) {
            display: none !important;
            opacity: 0 !important;
            visibility: hidden !important;
          }
          /* Force hide any poster elements */
          .lg-poster-force-hide {
            display: none !important;
            opacity: 0 !important;
            visibility: hidden !important;
          }
          /* Fix for video element containment */
          .lg-video-cont {
            z-index: 1000 !important;
            position: relative !important;
          }
          /* Ensure proper video layer ordering */
          .lg-video-poster-fix .lg-video {
            z-index: 100 !important;
          }
          .lg-video-poster-fix .lg-video-object {
            z-index: 1000 !important;
          }
          /* Hide any background containers */
          .lg-media-container > :not(.lg-video-cont) {
            display: none !important;
            opacity: 0 !important;
            visibility: hidden !important;
          }
          
          /* Hide thumbnail container */
          .lg-thumb-outer {
            display: none !important;
          }
          
          /* Increase space for main content by removing thumbnail space */
          .lg-outer .lg-inner {
            height: 100% !important;
          }
          
          .lg-outer .lg-object {
            max-height: calc(100vh - 80px) !important;
          }
        `,
        }}
      />
    </div>
  );
};

import React, { useEffect, useRef, useState } from "react";
import lgThumbnail from "lightgallery/plugins/thumbnail";
import lgZoom from "lightgallery/plugins/zoom";

// Import styles
import "lightgallery/css/lightgallery.css";
import "lightgallery/css/lg-zoom.css";
import "lightgallery/css/lg-thumbnail.css";
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
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const initializedRef = useRef(false);
  const prevInstancesRef = useRef<Element[]>([]);
  const cleanupTimerRef = useRef<number | null>(null);

  console.log("LightGalleryComponent rendering with startIndex:", startIndex);

  // Immediate cleanup on mount and prevent duplicate galleries
  useEffect(() => {
    // Clear any existing timeout to prevent overlapping cleanups
    if (cleanupTimerRef.current) {
      window.clearTimeout(cleanupTimerRef.current);
    }

    // Global modal cleanup - must run before creating new instance
    const cleanupGalleries = () => {
      // Find all existing gallery instances and clean them up
      const existingGalleries = document.querySelectorAll(
        ".lg-backdrop, .lg-outer, .lg-container, .lg-next, .lg-prev, .lg-toolbar"
      );

      if (existingGalleries.length > 0) {
        console.log(`Cleaning up ${existingGalleries.length} gallery elements`);
        existingGalleries.forEach((el) => {
          try {
            if (el && el.parentNode) {
              el.parentNode.removeChild(el);
            }
          } catch (e) {
            console.error("Error removing gallery element:", e);
          }
        });
      }

      // Remove any event listeners left over
      const possibleLgContainers = document.querySelectorAll("[class*='lg-']");
      possibleLgContainers.forEach((el) => {
        const clone = el.cloneNode(true);
        if (el.parentNode) {
          el.parentNode.replaceChild(clone, el);
        }
      });

      // Reset body scrolling
      document.body.style.removeProperty("overflow");
      document.body.style.removeProperty("height");
      document.body.style.removeProperty("width");
      document.body.style.removeProperty("position");
    };

    // Clean up any lingering galleries
    cleanupGalleries();

    // Prevent body scrolling while gallery is open
    document.body.style.overflow = "hidden";

    return () => {
      // Restore body scrolling and do final cleanup
      document.body.style.overflow = "";

      // Cleanup on unmount with slight delay to ensure proper execution
      cleanupTimerRef.current = window.setTimeout(() => {
        cleanupGalleries();

        // Additional cleanup for any in-progress operations
        if (lightGalleryRef.current) {
          try {
            lightGalleryRef.current.destroy();
            lightGalleryRef.current = null;
          } catch (e) {
            console.warn("Error during gallery cleanup:", e);
          }
        }
      }, 50);
    };
  }, []);

  // Update index on navigation
  useEffect(() => {
    if (startIndex !== currentIndex) {
      setCurrentIndex(startIndex);
    }
  }, [startIndex, currentIndex]);

  // Initialize gallery
  useEffect(() => {
    // Prevent re-initialization if already initialized with same media
    if (initializedRef.current && lightGalleryRef.current) {
      // Just update the slide if needed
      if (lightGalleryRef.current.index !== currentIndex) {
        try {
          lightGalleryRef.current.slide(currentIndex, false);
        } catch (e) {
          console.error("Failed to update slide index:", e);
          // Destroy and reinitialize on error
          try {
            lightGalleryRef.current.destroy();
            initializedRef.current = false;
          } catch {
            // Ignore secondary errors
          }
        }
      }
      return;
    }

    // Make sure any existing galleries are cleaned up
    const existingGalleries = document.querySelectorAll(
      ".lg-backdrop, .lg-outer"
    );
    existingGalleries.forEach((el) => {
      if (el.parentNode) el.parentNode.removeChild(el);
    });

    if (!containerRef.current) return;

    // Recreate the gallery container
    const galleryContainerParent = containerRef.current;
    let galleryContainer =
      galleryContainerParent.querySelector(".lg-container");

    // Remove old container if it exists
    if (galleryContainer) {
      galleryContainerParent.removeChild(galleryContainer);
    }

    // Create a fresh container
    galleryContainer = document.createElement("div");
    galleryContainer.className = "lg-container";
    galleryContainerParent.appendChild(galleryContainer);

    // Create gallery items
    mediaItems.forEach((media) => {
      const url = config.getImageUrl(media.url);

      // Use a static image for video thumbnails to prevent video loading
      const thumbnailUrl = media.thumbnailUrl
        ? config.getImageUrl(media.thumbnailUrl)
        : media.type === "video"
        ? `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 100 100"><rect width="100%" height="100%" fill="%23374151"/><circle cx="50" cy="50" r="20" fill="%23FFFFFF" opacity="0.7"/><polygon points="45,40 45,60 60,50" fill="%23374151"/></svg>`
        : url;

      const item = document.createElement("a");
      item.href = url;
      item.setAttribute("data-lg-size", "1600-1067");

      // Explicitly mark media type to prevent incorrect handling
      item.setAttribute("data-media-type", media.type);

      if (media.type === "video") {
        // Set attributes for videos
        item.setAttribute("data-video", "true");
        item.setAttribute("data-iframe", "true");
        item.setAttribute("data-src", url);

        // Explicitly disable autoplay
        item.setAttribute("data-autoplay", "false");
        item.setAttribute("data-preload", "none");
        item.setAttribute("data-lazy-load", "true");
        item.setAttribute("data-poster", thumbnailUrl);

        // Custom HTML for video player with many safeguards
        item.setAttribute(
          "data-html",
          `<div class="lg-video-container">
             <video 
               class="lg-video-object lg-html5" 
               controls 
               preload="none" 
               poster="${thumbnailUrl}"
               playsinline
             >
               <source src="${url}" type="video/mp4">
               Your browser does not support HTML5 video.
             </video>
           </div>`
        );
      } else {
        // Set attributes for images to prevent video behavior
        item.setAttribute("data-video", "false");
        item.setAttribute("data-iframe", "false");
      }

      // Create thumbnail image
      const img = document.createElement("img");
      img.src = thumbnailUrl;
      img.alt = media.description || "";
      img.setAttribute("loading", "lazy");

      item.appendChild(img);
      galleryContainer.appendChild(item);
    });

    // Initialize LightGallery
    if (lightGalleryRef.current) {
      lightGalleryRef.current.destroy();
    }

    // Use the vanilla js version for better control
    import("lightgallery").then((lightGallery) => {
      lightGalleryRef.current = lightGallery.default(
        galleryContainer as HTMLElement,
        {
          plugins: [lgZoom, lgThumbnail],
          selector: "a",
          download: false,
          counter: true,
          closable: true,
          showCloseIcon: true,
          thumbnail: thumbnailsEnabled,
          speed: 300,
          loop: true,
          hideScrollbar: true,
          enableSwipe: true,
          enableDrag: true,
          iframeMaxWidth: "100%",
          controls: true,
          addClass: "lg-custom-controls",
          appendSubHtmlTo: ".lg-outer",
          mode: "lg-slide",
          mobileSettings: {
            controls: true,
            showCloseIcon: true,
            download: false,
          },
          index: currentIndex,
        }
      );

      initializedRef.current = true;

      // Add event listeners
      galleryContainer.addEventListener("lgAfterSlide", (e: any) => {
        if (e.detail && typeof e.detail.index === "number") {
          // Only update state if the index actually changed
          if (e.detail.index !== currentIndex) {
            setCurrentIndex(e.detail.index);
            if (onSlide) {
              onSlide(e.detail.index);
            }
          }
        }
      });

      galleryContainer.addEventListener("lgBeforeClose", () => {
        onClose?.();
      });

      // Open to the correct slide
      setTimeout(() => {
        if (lightGalleryRef.current) {
          try {
            lightGalleryRef.current.openGallery(currentIndex);
          } catch (e) {
            console.error("Failed to open gallery:", e);

            // Try direct method if open gallery fails
            const slides = galleryContainer.querySelectorAll("a");
            if (slides && slides.length > currentIndex) {
              (slides[currentIndex] as HTMLElement).click();
            }
          }
        }
      }, 100);
    });

    // Clean up
    return () => {
      if (lightGalleryRef.current) {
        try {
          lightGalleryRef.current.destroy();
        } catch (e) {
          console.error("Failed to destroy gallery:", e);
        }
        lightGalleryRef.current = null;
        initializedRef.current = false;
      }
    };
  }, [mediaItems, onClose, onSlide, thumbnailsEnabled, startIndex]);

  // Notify that navigation is complete
  useEffect(() => {
    window.dispatchEvent(new Event("navigationEnd"));

    // Add custom CSS for the gallery controls
    const style = document.createElement("style");
    style.textContent = `
      .lg-outer .lg-toolbar {
        background-color: rgba(0, 0, 0, 0.45);
        opacity: 1;
      }
      .lg-outer .lg-toolbar .lg-icon {
        color: #fff;
      }
      .lg-outer .lg-prev, 
      .lg-outer .lg-next {
        opacity: 0.7;
        background-color: rgba(0, 0, 0, 0.45);
      }
      .lg-outer .lg-prev:hover, 
      .lg-outer .lg-next:hover {
        opacity: 1;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div
      className="light-gallery-container fixed inset-0 z-[999] bg-black"
      ref={containerRef}
    ></div>
  );
};

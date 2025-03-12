import React, { useEffect, useRef } from "react";
import LightGallery from "lightgallery/react";
import { LightGallerySettings } from "lightgallery/lg-settings";
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

  console.log("LightGalleryComponent rendering with startIndex:", startIndex);

  // Initialize gallery
  useEffect(() => {
    if (containerRef.current) {
      // Create gallery container if it doesn't exist
      let galleryContainer =
        containerRef.current.querySelector(".lg-container");
      if (!galleryContainer) {
        galleryContainer = document.createElement("div");
        galleryContainer.className = "lg-container";
        containerRef.current.appendChild(galleryContainer);
      }

      // Create gallery items
      galleryContainer.innerHTML = "";

      mediaItems.forEach((media, idx) => {
        const url = config.getImageUrl(media.url);
        const thumbnailUrl = media.thumbnailUrl
          ? config.getImageUrl(media.thumbnailUrl)
          : media.type === "video"
          ? config.getVideoThumbnailUrl(media.url)
          : url;

        const item = document.createElement("a");
        item.href = url;
        item.setAttribute("data-lg-size", "1600-1067");

        if (media.type === "video") {
          item.setAttribute("data-iframe", "true");
          item.setAttribute("data-src", url);
        }

        const img = document.createElement("img");
        img.src = thumbnailUrl;
        img.alt = media.description || "";

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
          }
        );

        // Add event listeners
        galleryContainer.addEventListener("lgAfterSlide", (e: any) => {
          if (onSlide && e.detail && typeof e.detail.index === "number") {
            onSlide(e.detail.index);
          }
        });

        galleryContainer.addEventListener("lgBeforeClose", () => {
          onClose?.();
        });

        // Open to the correct slide
        setTimeout(() => {
          if (lightGalleryRef.current) {
            try {
              lightGalleryRef.current.openGallery(startIndex);
            } catch (e) {
              console.error("Failed to open gallery:", e);

              // Try direct method if open gallery fails
              const slides = galleryContainer.querySelectorAll("a");
              if (slides && slides.length > startIndex) {
                (slides[startIndex] as HTMLElement).click();
              }
            }
          }
        }, 100);
      });
    }

    // Clean up
    return () => {
      if (lightGalleryRef.current) {
        try {
          lightGalleryRef.current.destroy();
        } catch (e) {
          console.error("Failed to destroy gallery:", e);
        }
        lightGalleryRef.current = null;
      }
    };
  }, [mediaItems, startIndex, onClose, onSlide, thumbnailsEnabled]);

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

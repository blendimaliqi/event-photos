import React, { RefObject } from "react";
import { Media } from "../../types/media";

interface MediaContentProps {
  currentMedia: Media;
  isVideo: boolean;
  isLoading: boolean;
  isFullscreen: boolean;
  isMuted: boolean;
  videoRef: RefObject<HTMLVideoElement>;
  handleImageLoad: () => void;
  toggleFullscreen: () => void;
}

const MediaContent: React.FC<MediaContentProps> = ({
  currentMedia,
  isVideo,
  isLoading,
  isFullscreen,
  isMuted,
  videoRef,
  handleImageLoad,
  toggleFullscreen,
}) => {
  return (
    <div
      className={`transition-opacity duration-300 ${
        isLoading ? "opacity-30" : "opacity-100"
      } flex items-center justify-center relative cursor-pointer`}
      onClick={(e) => {
        // Handle fullscreen toggle only for photos, not videos
        if (
          !isVideo && // Only for photos
          (e.target === e.currentTarget ||
            (currentMedia.type === "photo" &&
              e.target instanceof HTMLImageElement))
        ) {
          e.stopPropagation();
          toggleFullscreen();
        }
      }}
    >
      {currentMedia.type === "photo" ? (
        <img
          src={currentMedia.url}
          alt={currentMedia.description || "Photo"}
          className={`
            max-w-full object-contain rounded shadow-lg transition-all duration-300
            ${isFullscreen ? "max-h-screen" : "max-h-[calc(100vh-180px)]"}
          `}
          style={{ objectFit: "scale-down" }}
          onLoad={handleImageLoad}
        />
      ) : (
        <div className="video-controls">
          <video
            ref={videoRef}
            src={currentMedia.url}
            poster={currentMedia.thumbnailUrl}
            className={`
              max-w-full rounded shadow-lg transition-all duration-300
              ${isFullscreen ? "max-h-screen" : "max-h-[calc(100vh-180px)]"}
            `}
            style={{ objectFit: "scale-down" }}
            controls
            loop={false}
            muted={isMuted}
            playsInline
            preload="metadata"
            onCanPlay={() => {
              // Make sure video is definitely paused when ready
              if (videoRef.current) {
                videoRef.current.pause();
              }
              handleImageLoad();
            }}
          >
            Your browser does not support the video tag.
          </video>
        </div>
      )}
    </div>
  );
};

export default MediaContent;

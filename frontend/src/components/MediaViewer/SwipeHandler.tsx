import React from "react";
import { Media } from "../../types/media";

interface SwipeHandlerProps {
  swiping: boolean;
  swipeOffset: number;
  isAnimatingSwipe: boolean;
  swipeTransform: string;
  prevMedia: Media;
  nextMedia: Media;
  isFullscreen: boolean;
  children: React.ReactNode;
}

const SwipeHandler: React.FC<SwipeHandlerProps> = ({
  swiping,
  swipeOffset,
  isAnimatingSwipe,
  swipeTransform,
  prevMedia,
  nextMedia,
  isFullscreen,
  children,
}) => {
  return (
    <>
      {/* Swipeable content container */}
      <div
        className={`absolute inset-0 flex items-center justify-center ${
          isAnimatingSwipe ? "transition-transform duration-300 ease-out" : ""
        }`}
        style={{ transform: swipeTransform }}
      >
        {/* Previous media (only visible during swipe) */}
        {swiping && swipeOffset > 0 && (
          <div className="absolute inset-0 flex items-center justify-center opacity-70 -translate-x-full">
            {prevMedia.type === "photo" ? (
              <img
                src={prevMedia.url}
                alt=""
                className={`max-w-full object-contain rounded shadow-lg ${
                  isFullscreen ? "max-h-screen" : "max-h-[calc(100vh-180px)]"
                }`}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <img
                  src={prevMedia.thumbnailUrl || ""}
                  alt=""
                  className={`max-w-full object-contain rounded shadow-lg ${
                    isFullscreen ? "max-h-screen" : "max-h-[calc(100vh-180px)]"
                  }`}
                />
              </div>
            )}
          </div>
        )}

        {/* Current media */}
        {children}

        {/* Next media (only visible during swipe) */}
        {swiping && swipeOffset < 0 && (
          <div className="absolute inset-0 flex items-center justify-center opacity-70 translate-x-full">
            {nextMedia.type === "photo" ? (
              <img
                src={nextMedia.url}
                alt=""
                className={`max-w-full object-contain rounded shadow-lg ${
                  isFullscreen ? "max-h-screen" : "max-h-[calc(100vh-180px)]"
                }`}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <img
                  src={nextMedia.thumbnailUrl || ""}
                  alt=""
                  className={`max-w-full object-contain rounded shadow-lg ${
                    isFullscreen ? "max-h-screen" : "max-h-[calc(100vh-180px)]"
                  }`}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Swipe indicators */}
      {swiping && (
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none z-30">
          {swipeOffset > 20 && (
            <div className="bg-white/20 rounded-full p-3 ml-6 backdrop-blur-sm">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </div>
          )}

          {swipeOffset < -20 && (
            <div className="bg-white/20 rounded-full p-3 mr-6 ml-auto backdrop-blur-sm">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default SwipeHandler;

import React from "react";

interface NavigationControlsProps {
  isFullscreen: boolean;
  handlePrevious: () => void;
  handleNext: () => void;
}

const NavigationControls: React.FC<NavigationControlsProps> = ({
  isFullscreen,
  handlePrevious,
  handleNext,
}) => {
  return (
    <div
      className={`absolute inset-y-0 left-0 right-0 flex items-center justify-between pointer-events-none z-20 transition-opacity duration-300 ${
        isFullscreen ? "opacity-0" : "opacity-100"
      }`}
    >
      <button
        className="pointer-events-auto bg-black/50 hover:bg-black/70 text-white p-2 ml-4 rounded-full w-12 h-12 flex items-center justify-center transition-transform transform hover:scale-105 focus:outline-none shadow-lg"
        onClick={handlePrevious}
        aria-label="Previous"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-7 w-7"
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
      </button>

      <button
        className="pointer-events-auto bg-black/50 hover:bg-black/70 text-white p-2 mr-4 rounded-full w-12 h-12 flex items-center justify-center transition-transform transform hover:scale-105 focus:outline-none shadow-lg"
        onClick={handleNext}
        aria-label="Next"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-7 w-7"
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
      </button>
    </div>
  );
};

export default NavigationControls;

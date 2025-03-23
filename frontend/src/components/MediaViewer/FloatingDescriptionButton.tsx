import React from "react";

interface FloatingDescriptionButtonProps {
  hasDescription: boolean;
  showDescription: boolean;
  isFullscreen: boolean;
  toggleDescription: () => void;
}

const FloatingDescriptionButton: React.FC<FloatingDescriptionButtonProps> = ({
  hasDescription,
  showDescription,
  isFullscreen,
  toggleDescription,
}) => {
  if (!hasDescription || showDescription || isFullscreen) return null;

  return (
    <button
      onClick={toggleDescription}
      className="absolute bottom-[120px] right-4 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full shadow-lg z-30"
      aria-label="Show description"
      title="Show description (D)"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    </button>
  );
};

export default FloatingDescriptionButton;

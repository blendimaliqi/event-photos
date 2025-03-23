import React from "react";

interface DescriptionPanelProps {
  description: string | undefined;
  showDescription: boolean;
  isFullscreen: boolean;
  toggleDescription: () => void;
}

const DescriptionPanel: React.FC<DescriptionPanelProps> = ({
  description,
  showDescription,
  isFullscreen,
  toggleDescription,
}) => {
  if (!description || !showDescription || isFullscreen) return null;

  return (
    <div className="absolute bottom-[100px] left-1/2 transform -translate-x-1/2 z-20 transition-opacity duration-300 ease-in-out">
      <div className="bg-black/75 rounded-lg shadow-lg overflow-hidden max-w-3xl w-[95vw] backdrop-blur-sm">
        <div className="flex items-center justify-between px-4 py-2 bg-black/50">
          <h3 className="text-white text-sm font-medium">Mesazh</h3>
          <button
            onClick={toggleDescription}
            className="text-white/80 hover:text-white p-1 rounded-full"
            aria-label="Close description"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div className="p-4 text-white max-h-[25vh] overflow-y-auto">
          {description}
        </div>
      </div>
    </div>
  );
};

export default DescriptionPanel;

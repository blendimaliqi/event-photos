import React from "react";

interface FullScreenIndicatorProps {
  isFullscreen: boolean;
  showFullscreenIndicator: boolean;
}

const FullScreenIndicator: React.FC<FullScreenIndicatorProps> = ({
  isFullscreen,
  showFullscreenIndicator,
}) => {
  if (!isFullscreen || !showFullscreenIndicator) return null;

  return (
    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-black/40 text-white text-sm py-2 px-4 rounded-full backdrop-blur-sm transition-opacity duration-300 pointer-events-none">
      Kliko për të dalë nga ekrani i plotë
    </div>
  );
};

export default FullScreenIndicator;

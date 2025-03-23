import React from "react";

interface LoadingIndicatorProps {
  isLoading: boolean;
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ isLoading }) => {
  if (!isLoading) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center z-30">
      <div className="animate-spin rounded-full h-12 w-12 border-2 border-white border-t-transparent"></div>
    </div>
  );
};

export default LoadingIndicator;

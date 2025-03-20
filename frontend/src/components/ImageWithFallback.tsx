import { useState } from "react";

interface ImageWithFallbackProps {
  src: string;
  alt: string;
  fallbackSrc?: string;
  className?: string;
  loading?: "lazy" | "eager";
  onClick?: () => void;
}

export const ImageWithFallback = ({
  src,
  alt,
  fallbackSrc = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 100 100"><rect width="100%" height="100%" fill="%23f3f4f6"/><text x="50%" y="50%" font-family="Arial" font-size="14" fill="%239ca3af" text-anchor="middle" dominant-baseline="middle">Image Error</text></svg>',
  className = "",
  loading = "lazy",
  onClick,
}: ImageWithFallbackProps) => {
  const [error, setError] = useState(false);

  const handleError = () => {
    console.error(`Failed to load image: ${src}`);
    setError(true);
  };

  return (
    <img
      src={error ? fallbackSrc : src}
      alt={alt}
      className={className}
      loading={loading}
      onClick={onClick}
      onError={handleError}
    />
  );
};

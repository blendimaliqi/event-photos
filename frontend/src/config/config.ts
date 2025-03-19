export const config = {
  // Get base URL from environment variable or use relative URL in production
  API_BASE_URL: (() => {
    // Use environment variable if available
    if (import.meta.env.VITE_API_URL) {
      return import.meta.env.VITE_API_URL;
    }

    // In production, use a relative URL or derive from current origin
    if (import.meta.env.PROD) {
      // If we're in a browser environment
      if (typeof window !== "undefined") {
        return window.location.origin; // Use same origin as frontend
      }
      return ""; // Fallback to relative URLs
    }

    // Development fallback
    return "http://localhost:5035";
  })(),

  // Use the computed base URL for API endpoint
  API_ENDPOINT: (() => {
    // Use environment variable if available
    const baseUrl =
      import.meta.env.VITE_API_URL ||
      (import.meta.env.PROD && typeof window !== "undefined"
        ? window.location.origin
        : "http://localhost:5035");

    return `${baseUrl}/api`;
  })(),

  // Functions using the dynamic base URL
  getImageUrl: (path: string) => {
    // Make sure we have a path
    if (!path) return "";

    // If the path already starts with http or https, it's already an absolute URL
    if (path.startsWith("http://") || path.startsWith("https://")) {
      return path;
    }

    // Get the base URL
    const baseUrl =
      import.meta.env.VITE_API_URL ||
      (import.meta.env.PROD && typeof window !== "undefined"
        ? window.location.origin
        : "http://localhost:5035");

    // Make sure the path starts with a slash for proper URL construction
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;

    console.log(`Constructed image URL: ${baseUrl}${normalizedPath}`);
    return `${baseUrl}${normalizedPath}`;
  },

  getVideoThumbnailUrl: () => {
    // Return a data URL for a gray gradient instead of trying to load a video thumbnail
    // This prevents the app from trying to load the entire video file for thumbnails
    return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 100 100"><rect width="100%" height="100%" fill="%23374151"/></svg>`;
  },
};

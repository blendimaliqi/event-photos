export const config = {
  // Get base URL from environment variable or use relative URL in production
  API_BASE_URL: (() => {
    // Use environment variable if available
    if (import.meta.env.VITE_API_URL) {
      console.log(
        `Using VITE_API_URL from env: ${import.meta.env.VITE_API_URL}`
      );
      return import.meta.env.VITE_API_URL;
    }

    // In production, use a relative URL or derive from current origin
    if (import.meta.env.PROD) {
      // If we're in a browser environment
      if (typeof window !== "undefined") {
        console.log(`Using window.location.origin: ${window.location.origin}`);
        return window.location.origin; // Use same origin as frontend
      }
      return ""; // Fallback to relative URLs
    }

    // Development fallback
    console.log("Using development fallback URL: http://localhost:5035");
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

    console.log(`API_ENDPOINT set to: ${baseUrl}/api`);
    return `${baseUrl}/api`;
  })(),

  // Functions using the dynamic base URL
  getImageUrl: (path: string) => {
    // Make sure we have a path
    if (!path) return "";

    try {
      // If the path already starts with http or https, it's already an absolute URL
      if (path.startsWith("http://") || path.startsWith("https://")) {
        console.log(`IMAGE: Using absolute URL: ${path}`);
        return path;
      }

      // FIXED: Always use the VITE_API_URL for uploads, regardless of the current origin
      // This ensures all media requests go to the backend server where files are actually stored
      const baseUrl =
        import.meta.env.VITE_API_URL ||
        (import.meta.env.PROD
          ? window.location.origin
          : "http://localhost:5035");

      // Make sure the path starts with a slash for proper URL construction
      const normalizedPath = path.startsWith("/") ? path : `/${path}`;

      // Use the full backend URL for all media paths
      const fullUrl = `${baseUrl}${normalizedPath}`;
      console.log(`IMAGE: Constructed image URL: ${fullUrl}`);

      // For debugging, add timestamp to bust cache during development
      if (!import.meta.env.PROD) {
        return `${fullUrl}?t=${Date.now()}`;
      }

      return fullUrl;
    } catch (error) {
      console.error("Error constructing image URL:", error);
      // Return a placeholder image if there's an error
      return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 100 100"><rect width="100%" height="100%" fill="%23f3f4f6"/><text x="50%" y="50%" font-family="Arial" font-size="14" fill="%239ca3af" text-anchor="middle" dominant-baseline="middle">Image Error</text></svg>`;
    }
  },

  getVideoThumbnailUrl: () => {
    // Return a data URL for a gray gradient instead of trying to load a video thumbnail
    // This prevents the app from trying to load the entire video file for thumbnails
    return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 100 100"><rect width="100%" height="100%" fill="%23374151"/></svg>`;
  },
};

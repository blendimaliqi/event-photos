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
    const baseUrl =
      import.meta.env.VITE_API_URL ||
      (import.meta.env.PROD && typeof window !== "undefined"
        ? window.location.origin
        : "http://localhost:5035");

    return `${baseUrl}${path}`;
  },

  getVideoThumbnailUrl: (path: string) => {
    const baseUrl =
      import.meta.env.VITE_API_URL ||
      (import.meta.env.PROD && typeof window !== "undefined"
        ? window.location.origin
        : "http://localhost:5035");

    return `${baseUrl}${path}?thumbnail=true`;
  },
};

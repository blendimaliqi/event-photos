export const config = {
  API_BASE_URL: import.meta.env.VITE_API_URL || "http://localhost:5035",
  API_ENDPOINT: `${
    import.meta.env.VITE_API_URL || "http://localhost:5035"
  }/api`,
  getImageUrl: (path: string) =>
    `${import.meta.env.VITE_API_URL || "http://localhost:5035"}${path}`,
  getVideoThumbnailUrl: (path: string) => {
    // For video thumbnails, use the same URL but add a query parameter to indicate it's a thumbnail
    // This helps with caching and ensures it's treated as an image, not a video
    return `${
      import.meta.env.VITE_API_URL || "http://localhost:5035"
    }${path}?thumbnail=true`;
  },
};

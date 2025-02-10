export const config = {
  API_BASE_URL: import.meta.env.VITE_API_URL || "http://localhost:5035",
  API_ENDPOINT: `${
    import.meta.env.VITE_API_URL || "http://localhost:5035"
  }/api`,
  getImageUrl: (path: string) =>
    `${import.meta.env.VITE_API_URL || "http://localhost:5035"}${path}`,
};

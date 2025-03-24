import { useQuery } from "@tanstack/react-query";
import { config } from "../config/config";

const fallbackImageUrl =
  "https://images.unsplash.com/photo-1563865436914-44ee14a35e4b?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

export const useHeroImage = (heroPhotoUrl?: string) => {
  return useQuery({
    queryKey: ["heroImage", heroPhotoUrl],
    enabled: true, // Always run the query to at least get the fallback image
    staleTime: 0, // Changed from Infinity to 0 to always refetch when URL changes
    retry: 1, // Only retry once to avoid too many failed requests
    queryFn: async () => {
      if (!heroPhotoUrl) {
        return fallbackImageUrl;
      }

      try {
        const url = config.getImageUrl(heroPhotoUrl);
        const response = await fetch(url, { method: "HEAD" }).catch(() => ({
          ok: false,
        }));

        if (!response.ok) {
          console.error(`Hero image not found at URL: ${url}`);
          return fallbackImageUrl;
        }

        // Preload the image
        await new Promise((resolve, reject) => {
          const img = new Image();
          img.src = url;
          img.onload = resolve;
          img.onerror = (err) => {
            console.error("Image load error:", err);
            reject(err);
          };

          // Set a timeout to avoid hanging preloads
          setTimeout(() => resolve(null), 5000);
        });

        return url;
      } catch (error) {
        console.error("Failed to load hero image:", error);
        return fallbackImageUrl;
      }
    },
  });
};

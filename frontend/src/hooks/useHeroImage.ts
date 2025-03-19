import { useQuery } from "@tanstack/react-query";
import { config } from "../config/config";

const fallbackImageUrl =
  "https://images.unsplash.com/photo-1563865436914-44ee14a35e4b?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

export const useHeroImage = (heroPhotoUrl?: string) => {
  return useQuery({
    queryKey: ["heroImage", heroPhotoUrl],
    enabled: true, // Always run the query to at least get the fallback image
    staleTime: Infinity, // Image preload result doesn't need to be refetched
    queryFn: async () => {
      if (!heroPhotoUrl) {
        console.log("No hero photo URL provided, using fallback");
        return fallbackImageUrl;
      }

      try {
        console.log("Loading hero image from URL:", heroPhotoUrl);
        const url = config.getImageUrl(heroPhotoUrl);
        console.log("Full image URL:", url);

        // Preload the image
        await new Promise((resolve, reject) => {
          const img = new Image();
          img.src = url;
          img.onload = resolve;
          img.onerror = (err) => {
            console.error("Image load error:", err);
            reject(err);
          };
        });

        return url;
      } catch (error) {
        console.error("Failed to load hero image:", error);
        return fallbackImageUrl;
      }
    },
  });
};

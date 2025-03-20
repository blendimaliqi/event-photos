import { motion } from "framer-motion";
import { Navigation } from "./Navigation";
import { Event } from "../types/event";
import { useQuery } from "@tanstack/react-query";
import { EVENT_QUERY_KEY } from "../hooks/useEvent";
import { useHeroImage } from "../hooks/useHeroImage";
import { useHeroPhoto } from "../hooks/useHeroPhoto";

interface HeroSectionProps {
  event?: Event | null;
  isAdmin?: boolean;
  isPhotoView?: boolean;
}

export const HeroSection = ({
  event,
  isAdmin,
  isPhotoView,
}: HeroSectionProps) => {
  // First get the event data to ensure we have the latest hero photo
  const { data: latestEvent } = useQuery({
    queryKey: EVENT_QUERY_KEY.event(event?.id || 0),
    enabled: !!event?.id,
    initialData: event,
    queryFn: async () => {
      if (!event?.id) return event || null;

      // This is just a placeholder since we're relying on initialData
      // and the actual fetching happens in useEvent hook
      return event || null;
    },
  });

  // Get the hero photo directly from the dedicated endpoint
  const { data: heroPhoto } = useHeroPhoto(latestEvent?.id);

  // Then preload the hero image
  const { data: currentImageUrl, isLoading } = useHeroImage(
    // Try multiple sources for the hero photo URL
    latestEvent?.heroPhotoUrl || heroPhoto?.url || latestEvent?.heroPhoto?.url
  );

  return (
    <motion.div
      key={isAdmin ? "admin-photo" : "gallery"}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative h-[90vh] bg-black"
    >
      <div className="absolute inset-0">
        {isLoading ? (
          <div className="absolute inset-0 bg-black flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin" />
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url("${currentImageUrl}")`,
              backgroundPosition: "center 35%",
            }}
          >
            <div className="absolute inset-0 bg-black/40" />
            <div className="absolute inset-x-0 bottom-0 h-2 bg-gradient-to-b from-transparent to-gray-100" />
          </motion.div>
        )}
      </div>

      <Navigation />

      <div className="relative z-10 h-full flex items-center justify-center text-center px-4">
        <div className="max-w-3xl">
          <h2 className="text-4xl sm:text-6xl font-serif italic text-white mb-6 tracking-wide">
            {isAdmin
              ? "Paneli i Administratorit"
              : isPhotoView
              ? "Pamja e Fotos"
              : "Mirë se vini në Galerinë tonë të Dasmës"}
          </h2>
          <p className="text-xl text-rose-100 font-serif tracking-wider">
            {isAdmin
              ? "Menaxho fotot e dasmës ❤"
              : isPhotoView
              ? "Shiko dhe menaxho fotot ❤"
              : "Ngarko dhe shiko fotot ❤"}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Navigation } from "./Navigation";
import { config } from "../config/config";
import { Event } from "../types/event";

interface HeroSectionProps {
  event?: Event;
  isAdmin?: boolean;
  isPhotoView?: boolean;
}

export const HeroSection = ({
  event,
  isAdmin,
  isPhotoView,
}: HeroSectionProps) => {
  const [isHeroImageLoaded, setIsHeroImageLoaded] = useState(false);
  const fallbackImageUrl =
    "https://images.unsplash.com/photo-1563865436914-44ee14a35e4b?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
  const heroImageUrl = event?.heroPhoto?.url
    ? config.getImageUrl(event.heroPhoto.url)
    : fallbackImageUrl;

  useEffect(() => {
    if (heroImageUrl) {
      const img = new Image();
      img.src = heroImageUrl;
      img.onload = () => setIsHeroImageLoaded(true);
      img.onerror = () => {
        if (heroImageUrl !== fallbackImageUrl) {
          const fallbackImg = new Image();
          fallbackImg.src = fallbackImageUrl;
          fallbackImg.onload = () => setIsHeroImageLoaded(true);
        }
      };
    }
  }, [heroImageUrl]);

  return (
    <motion.div
      key={isAdmin ? "admin-photo" : "gallery"}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative h-[90vh] bg-black"
    >
      <div className="absolute inset-0">
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: isHeroImageLoaded ? 0 : 1 }}
          className="absolute inset-0 bg-black flex items-center justify-center"
        >
          <div className="w-8 h-8 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isHeroImageLoaded ? 1 : 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url("${heroImageUrl}")`,
            backgroundPosition: "center 35%",
          }}
        >
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute inset-x-0 bottom-0 h-2 bg-gradient-to-b from-transparent to-gray-100" />
        </motion.div>
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

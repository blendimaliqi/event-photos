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
  const [isLoading, setIsLoading] = useState(true);
  const [currentImageUrl, setCurrentImageUrl] = useState<string>("");
  const fallbackImageUrl =
    "https://images.unsplash.com/photo-1563865436914-44ee14a35e4b?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

  useEffect(() => {
    const loadImage = async (url: string) => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = url;
        img.onload = () => resolve(url);
        img.onerror = reject;
      });
    };

    const initializeImage = async () => {
      setIsLoading(true);

      if (event?.heroPhoto?.url) {
        try {
          const heroUrl = config.getImageUrl(event.heroPhoto.url);
          await loadImage(heroUrl);
          setCurrentImageUrl(heroUrl);
        } catch (error) {
          console.error("Failed to load hero image:", error);
          await loadImage(fallbackImageUrl);
          setCurrentImageUrl(fallbackImageUrl);
        }
      } else {
        await loadImage(fallbackImageUrl);
        setCurrentImageUrl(fallbackImageUrl);
      }

      setIsLoading(false);
    };

    initializeImage();
  }, [event?.heroPhoto?.url]);

  return (
    <motion.div
      key={isAdmin ? "admin-photo" : "gallery"}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative h-[90vh] bg-black"
    >
      <div className="absolute inset-0">
        {isLoading ? null : (
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

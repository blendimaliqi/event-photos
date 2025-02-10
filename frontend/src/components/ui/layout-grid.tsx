"use client";
import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Card = {
  id: number;
  content: React.ReactNode;
  className: string;
  thumbnail: string;
};

export const LayoutGrid = ({ cards }: { cards: Card[] }) => {
  const [selected, setSelected] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleClick = (id: number) => {
    setSelected(id === selected ? null : id);
  };

  return (
    <div
      ref={containerRef}
      className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 2xl:columns-5 gap-4"
    >
      {cards.map((card) => (
        <div key={card.id} className="break-inside-avoid mb-4">
          <div
            onClick={() => handleClick(card.id)}
            className="relative overflow-hidden rounded-xl cursor-pointer shadow-lg group"
          >
            <img src={card.thumbnail} alt="" className="w-full object-cover" />
            <div
              className={`absolute inset-0 bg-gradient-to-b from-transparent to-black/50 transition-opacity duration-300 ${
                selected === card.id
                  ? "opacity-100"
                  : "opacity-0 group-hover:opacity-100"
              }`}
            />
            <AnimatePresence>
              {selected === card.id && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0 flex items-end p-6"
                >
                  {card.content}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      ))}
    </div>
  );
};

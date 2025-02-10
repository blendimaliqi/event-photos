"use client";
import { useRef, useState } from "react";
import { motion } from "framer-motion";

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
      className="mx-auto grid w-full grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 max-w-7xl"
    >
      {cards.map((card) => (
        <div
          key={card.id}
          className={`${card.className} aspect-[4/3] sm:aspect-[3/4] md:aspect-[4/3]`}
        >
          <motion.div
            layoutId={`card-${card.id}`}
            onClick={() => handleClick(card.id)}
            className={`relative overflow-hidden rounded-xl cursor-pointer shadow-lg h-full ${
              selected === card.id
                ? "fixed inset-0 z-50 m-auto max-w-4xl h-[80vh]"
                : "w-full"
            }`}
          >
            <motion.div
              className="relative z-20 h-full w-full"
              layoutId={`container-${card.id}`}
            >
              <motion.div
                className="absolute inset-0 z-10 h-full w-full"
                layoutId={`image-container-${card.id}`}
              >
                <img
                  src={card.thumbnail}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </motion.div>
              <motion.div
                className={`absolute inset-0 z-20 bg-gradient-to-b from-transparent to-black/30 ${
                  selected === card.id ? "opacity-100" : "opacity-0"
                }`}
              />
              {selected === card.id && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 z-30 flex items-end p-6"
                >
                  {card.content}
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        </div>
      ))}
    </div>
  );
};

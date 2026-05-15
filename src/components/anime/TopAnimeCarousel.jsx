import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Star, TrendingUp, PlayCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { seenNewStorage } from "@/lib/localStorage";

function CardSkeleton() {
  return (
    <div className="shrink-0 w-36 sm:w-44">
      <Skeleton className="w-full aspect-[3/4] rounded-2xl" />
      <Skeleton className="h-3.5 w-3/4 mt-2" />
    </div>
  );
}

function CarouselCard({ anime, index }) {
  const animeId = anime.animeId || "";
  const badgeId = `anime_new_${animeId}`;
  const [newVisible, setNewVisible] = useState(!seenNewStorage.isSeen(badgeId));

  const handleClick = () => {
    if (newVisible) {
      seenNewStorage.markSeen(badgeId);
      setNewVisible(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: Math.min(index * 0.04, 0.5) }}
      className="shrink-0 w-28 sm:w-36 md:w-44"
    >
      <Link to={`/anime/${encodeURIComponent(animeId)}`} className="group block" onClick={handleClick}>
        <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-secondary ring-1 ring-border/50">
          {anime.poster ? (
            <img
              src={anime.poster}
              alt={anime.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <PlayCircle className="w-10 h-10 text-muted-foreground/30" />
            </div>
          )}

          {/* Rank */}
          <div className="absolute top-2 left-2 w-7 h-7 rounded-full bg-black/80 backdrop-blur-sm flex items-center justify-center shadow-lg">
            <span className="text-[10px] font-extrabold text-white">#{index + 1}</span>
          </div>

          {/* NEW badge or Score */}
          {newVisible ? (
            <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded-lg bg-green-500 text-[10px] font-extrabold text-white shadow-lg shadow-green-500/40">
              NEW
            </div>
          ) : (
            anime.score && parseFloat(anime.score) > 0 && (
              <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded-lg bg-black/70 backdrop-blur-sm text-[10px] font-bold text-yellow-400 flex items-center gap-0.5">
                <Star className="w-2.5 h-2.5 fill-current" />
                {parseFloat(anime.score).toFixed(1)}
              </div>
            )
          )}

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
            <div className="w-10 h-10 rounded-full bg-primary shadow-xl shadow-primary/50 flex items-center justify-center">
              <PlayCircle className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>

        <div className="mt-2 px-0.5">
          <h3 className="text-xs font-semibold line-clamp-2 group-hover:text-primary transition-colors leading-snug">
            {anime.title}
          </h3>
        </div>
      </Link>
    </motion.div>
  );
}

export default function TopAnimeCarousel({ animeList = [], isLoading, title = "Update Terbaru" }) {
  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-accent" />
        <h2 className="text-lg font-heading font-bold">{title}</h2>
      </div>

      <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 -mx-1 px-1">
        {isLoading
          ? Array(8).fill(0).map((_, i) => <CardSkeleton key={i} />)
          : animeList.map((anime, i) => (
              <CarouselCard key={anime.animeId || i} anime={anime} index={i} />
            ))}
      </div>
    </section>
  );
}
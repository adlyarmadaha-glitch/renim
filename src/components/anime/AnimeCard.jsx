import React, { useState } from "react";
import { Link } from "react-router-dom";
import { PlayCircle, Star } from "lucide-react";
import { motion } from "framer-motion";
import OptimizedImage from "./OptimizedImage";
import { seenNewStorage } from "@/lib/localStorage";

const DAY_MAP = {
  senin: "Sen", selasa: "Sel", rabu: "Rab", kamis: "Kam",
  jumat: "Jum", sabtu: "Sab", minggu: "Min",
};

function formatDay(day) {
  if (!day) return null;
  const lower = day.toLowerCase();
  for (const [key, val] of Object.entries(DAY_MAP)) {
    if (lower.includes(key)) return val;
  }
  return day;
}

export default function AnimeCard({ anime, index = 0, showNew = false }) {
  const animeId = anime.animeId || anime.slug || "";
  const title = anime.title || "Unknown";
  const poster = anime.poster || "";
  const episodesRaw = anime.totalEpisodes || anime.episodes;
  const episodes = episodesRaw && String(episodesRaw) !== "0" ? String(episodesRaw) : "";
  const score = anime.score || anime.rating || "";
  const day = formatDay(anime.releaseDay);

  // NEW badge: show if explicitly passed AND not yet dismissed
  const badgeId = `anime_new_${animeId}`;
  const shouldShowNew = showNew && !seenNewStorage.isSeen(badgeId);
  const [newVisible, setNewVisible] = useState(shouldShowNew);

  // Dismiss NEW badge when user clicks the anime card (navigates to detail/episode)
  const handleCardClick = () => {
    if (newVisible) {
      seenNewStorage.markSeen(badgeId);
      setNewVisible(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.04, 0.6), duration: 0.3 }}
    >
      <Link to={`/anime/${encodeURIComponent(animeId)}`} className="group block" onClick={handleCardClick}>
        <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-secondary ring-1 ring-border/50">
          {poster ? (
            <OptimizedImage
              src={poster}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              placeholderClass="w-full h-full"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <PlayCircle className="w-12 h-12 text-muted-foreground/40" />
            </div>
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Play button */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="w-12 h-12 rounded-full bg-primary shadow-xl shadow-primary/50 flex items-center justify-center">
              <PlayCircle className="w-6 h-6 text-white" />
            </div>
          </div>

          {/* Episode badge */}
          {episodes && (
            <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-primary/90 backdrop-blur-sm text-[10px] font-bold text-white leading-none">
              {episodes} Eps
            </div>
          )}

          {/* Score badge — hidden if NEW badge shown */}
          {score && parseFloat(score) > 0 && !newVisible && (
            <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-md bg-black/70 backdrop-blur-sm text-[10px] font-bold text-yellow-400 flex items-center gap-0.5 leading-none">
              <Star className="w-2.5 h-2.5 fill-current" />
              {parseFloat(score).toFixed(1)}
            </div>
          )}

          {/* Day badge */}
          {day && (
            <div className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-accent/90 backdrop-blur-sm text-[10px] font-bold text-white leading-none">
              {day}
            </div>
          )}

          {/* NEW badge — hilang saat card diklik */}
          {newVisible && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-md bg-green-500 text-[10px] font-extrabold text-white leading-none shadow-lg shadow-green-500/40 z-10"
            >
              NEW
            </motion.div>
          )}
        </div>

        <div className="mt-2 px-0.5">
          <h3 className="text-sm font-semibold line-clamp-2 group-hover:text-primary transition-colors leading-snug">
            {title}
          </h3>
        </div>
      </Link>
    </motion.div>
  );
}
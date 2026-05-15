import React, { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { mangaApi, SAFE_GENRES, mangaHistoryStorage } from "@/lib/mangaApi";
import { seenNewStorage } from "@/lib/localStorage";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import { Search, BookOpen, Star, TrendingUp, Clock, ChevronDown, History, X } from "lucide-react";

// ── MangaCard ──────────────────────────────────────────────────────────────
function MangaCard({ comic }) {
  const typeBg =
    comic.type === "Manhwa" ? "bg-blue-600/90"
    : comic.type === "Manhua" ? "bg-amber-600/90"
    : "bg-violet-600/90";

  const badgeId = `manga_new_${comic.slug}`;
  const shouldShowNew = comic.isNew && !seenNewStorage.isSeen(badgeId);
  const [newVisible, setNewVisible] = useState(shouldShowNew);

  const handleNewClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    seenNewStorage.markSeen(badgeId);
    setNewVisible(false);
  };

  return (
    <Link to={`/manga/${comic.slug}`}>
      <div className="group relative">
        <div className="aspect-[3/4] rounded-xl overflow-hidden bg-secondary relative">
          {comic.poster ? (
            <img
              src={comic.poster}
              alt={comic.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <BookOpen className="w-10 h-10 text-muted-foreground/30" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

          {/* Type badge top-left */}
          <div className="absolute top-1.5 left-1.5">
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md text-white ${typeBg}`}>
              {comic.type || "Manga"}
            </span>
          </div>

          {/* NEW badge top-right — klik untuk dismiss */}
          <AnimatePresence>
            {newVisible && (
              <motion.button
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                onClick={handleNewClick}
                className="absolute top-1.5 right-1.5 text-[9px] font-extrabold px-1.5 py-0.5 rounded-md text-white bg-green-500 animate-pulse shadow-lg shadow-green-500/40 z-10"
              >
                NEW
              </motion.button>
            )}
          </AnimatePresence>

          {/* Chapter bottom */}
          {comic.latestChapter && (
            <div className="absolute bottom-0 left-0 right-0 px-2 py-1.5 bg-gradient-to-t from-black/90 to-transparent">
              <p className="text-[9px] text-white/80 truncate font-medium">{comic.latestChapter}</p>
            </div>
          )}
        </div>
        <div className="mt-1.5">
          <p className="text-xs font-semibold line-clamp-2 leading-tight group-hover:text-primary transition-colors">
            {comic.title}
          </p>
          {comic.updatedAt && (
            <p className="text-[10px] text-muted-foreground/70 mt-0.5">{comic.updatedAt}</p>
          )}
        </div>
      </div>
    </Link>
  );
}

function MangaGridSkeleton() {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
      {Array(18).fill(0).map((_, i) => (
        <div key={i}>
          <Skeleton className="aspect-[3/4] rounded-xl" />
          <Skeleton className="h-3 w-3/4 mt-2" />
          <Skeleton className="h-2.5 w-1/2 mt-1" />
        </div>
      ))}
    </div>
  );
}

// ── ContinueReading ────────────────────────────────────────────────────────
function ContinueReading() {
  const history = mangaHistoryStorage.list().slice(0, 6);
  if (history.length === 0) return null;
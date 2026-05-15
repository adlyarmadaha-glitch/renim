import React, { useState, useCallback, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { donghuaApi } from "@/lib/donghuaApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Star, ChevronDown, Tv2, Eye, X, ChevronUp, Filter, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { donghuaSeenNew } from "@/lib/donghuaApi";
import ContinueWatchingDonghua from "@/components/donghua/ContinueWatchingDonghua";

// ── Card ─────────────────────────────────────────────────────────────────────
function DonghuaCard({ item }) {
  const isOngoing = (item.status || "").toLowerCase().includes("ongoing")
    || (item.status || "").toLowerCase().includes("airing");
  const isCompleted = (item.status || "").toLowerCase().includes("completed")
    || (item.status || "").toLowerCase().includes("tamat");

  const href = item.episodeSlug
    ? `/donghua/episode/${item.episodeSlug}`
    : `/donghua/${item.slug}`;
  const state = item.episodeSlug
    ? { animeSlug: item.slug, animeTitle: item.title, poster: item.poster }
    : {};

  const newKey = item.episodeSlug || item.slug || item.title;
  const isNew = !donghuaSeenNew.isSeen(newKey);

  return (
    <Link to={href} state={state} onClick={() => { if (isNew) donghuaSeenNew.markSeen(newKey); }}>
      <div className="group relative">
        <div className="aspect-[3/4] rounded-xl overflow-hidden bg-secondary relative shadow-md">
          {item.poster ? (
            <img src={item.poster} alt={item.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy" referrerPolicy="no-referrer"
              onError={(e) => { e.target.style.display = "none"; }} />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Tv2 className="w-10 h-10 text-muted-foreground/20" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-70 group-hover:opacity-90 transition-opacity" />

          {isNew && (
            <div className="absolute top-1.5 left-1.5 z-10">
              <span className="text-[8px] font-extrabold px-1.5 py-0.5 rounded text-white shadow-sm bg-green-500">NEW</span>
            </div>
          )}
          <div className={`absolute ${isNew ? "top-7" : "top-1.5"} left-1.5`}>
            <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded text-white shadow-sm ${
              isOngoing ? "bg-green-600" : isCompleted ? "bg-blue-600" : "bg-zinc-600"
            }`}>
              {isOngoing ? "ON-AIR" : isCompleted ? "TAMAT" : (item.type || "DONGHUA")}
            </span>
          </div>

          {item.score && (
            <div className="absolute top-1.5 right-1.5 flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-black/70 text-yellow-400 text-[9px] font-bold">
              <Star className="w-2 h-2 fill-current" />{item.score}
            </div>
          )}

          {item.views > 0 && (
            <div className="absolute bottom-0 left-0 right-0 px-2 py-1.5">
              <p className="text-[9px] text-white/70 flex items-center gap-0.5">
                <Eye className="w-2 h-2" />{(item.views / 1000).toFixed(0)}K
              </p>
            </div>
          )}
        </div>
        <div className="mt-1.5 space-y-0.5">
          <p className="text-xs font-semibold line-clamp-2 leading-tight group-hover:text-primary transition-colors">{item.title}</p>
          {item.ep && item.ep !== "Ongoing" && item.ep !== "Completed" && (
            <p className="text-[10px] text-muted-foreground/60 truncate">{item.ep}</p>
          )}
        </div>
      </div>
    </Link>
  );
}

function GridSkeleton() {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
      {Array(18).fill(0).map((_, i) => (
        <div key={i}>
          <Skeleton className="aspect-[3/4] rounded-xl" />
          <Skeleton className="h-3 w-3/4 mt-1.5" />
        </div>
      ))}
    </div>
  );
}

const STATIC_GENRES = [
  { name: "Action", slug: "action" }, { name: "Adventure", slug: "adventure" },
  { name: "Cultivation", slug: "cultivation" }, { name: "Fantasy", slug: "fantasy" },
  { name: "Martial Arts", slug: "martial-arts" }, { name: "Romance", slug: "romance" },
  { name: "Comedy", slug: "comedy" }, { name: "Drama", slug: "drama" },
  { name: "Historical", slug: "historical" }, { name: "Isekai", slug: "isekai" },
  { name: "Reincarnation", slug: "reincarnation" }, { name: "Magic", slug: "magic" },
  { name: "School", slug: "school" }, { name: "Slice of Life", slug: "slice-of-life" },
  { name: "Supernatural", slug: "supernatural" }, { name: "Mystery", slug: "mystery" },
];

// ── Infinite list for Ongoing / Completed / Genre ──────────────────────────
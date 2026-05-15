import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { historyStorage } from "@/lib/localStorage";
import { PlayCircle, History, Clock, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import OptimizedImage from "./OptimizedImage";

function timeAgo(isoStr) {
  if (!isoStr) return "";
  const diff = Date.now() - new Date(isoStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m || 1}m lalu`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}j lalu`;
  return `${Math.floor(h / 24)}h lalu`;
}

export default function ContinueWatching() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    setHistory(historyStorage.list().slice(0, 10));
  }, []);

  if (history.length === 0) return null;

  const removeItem = (e, episodeId) => {
    e.preventDefault();
    e.stopPropagation();
    historyStorage.remove(episodeId);
    setHistory(historyStorage.list().slice(0, 10));
  };

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center">
            <History className="w-3.5 h-3.5 text-primary" />
          </div>
          <h2 className="text-sm font-bold">Lanjut Menonton</h2>
        </div>
        <span className="text-[10px] text-muted-foreground">{history.length} riwayat</span>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {history.map((item, i) => (
          <motion.div
            key={item.episode_id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
            className="shrink-0 w-36 group relative"
          >
            <Link
              to={`/episode/${encodeURIComponent(item.episode_id)}`}
              state={{
                animeId: item.anime_id,
                animeTitle: item.anime_title,
                poster: item.poster,
              }}
            >
              {/* Thumbnail */}
              <div className="aspect-video rounded-xl overflow-hidden bg-secondary relative ring-1 ring-border/50">
                {item.poster ? (
                  <img
                    src={item.poster}
                    alt={item.anime_title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                    onError={(e) => { e.target.style.display = "none"; }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-secondary">
                    <PlayCircle className="w-8 h-8 text-muted-foreground/30" />
                  </div>
                )}

                {/* Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

                {/* Play hover */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-9 h-9 rounded-full bg-primary shadow-lg shadow-primary/50 flex items-center justify-center">
                    <PlayCircle className="w-5 h-5 text-white" />
                  </div>
                </div>

                {/* Episode label bottom */}
                <div className="absolute bottom-1.5 left-1.5 right-1.5">
                  <p className="text-[9px] text-white font-bold truncate leading-tight drop-shadow">
                    {item.episode_title || "Episode"}
                  </p>
                </div>

                {/* Progress bar — mock 60% karena tidak ada data real progress */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                  <div className="h-full bg-primary rounded-full" style={{ width: "60%" }} />
                </div>
              </div>

              {/* Info */}
              <div className="mt-1.5 px-0.5">
                <p className="text-[10px] font-semibold leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                  {item.anime_title}
                </p>
                {item.watched_at && (
                  <p className="text-[9px] text-muted-foreground mt-0.5 flex items-center gap-0.5">
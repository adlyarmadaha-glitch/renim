import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { donghuaStorage } from "@/lib/donghuaApi";
import { PlayCircle, X, History, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Baru saja";
  if (m < 60) return `${m} menit lalu`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} jam lalu`;
  return `${Math.floor(h / 24)} hari lalu`;
}

export default function ContinueWatchingDonghua() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    setHistory(donghuaStorage.getHistory().slice(0, 8));
  }, []);

  const handleRemove = (episodeId, e) => {
    e.preventDefault();
    e.stopPropagation();
    donghuaStorage.removeHistory(episodeId);
    setHistory(donghuaStorage.getHistory().slice(0, 8));
  };

  if (history.length === 0) return null;

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between px-0">
        <h2 className="font-heading font-extrabold text-base flex items-center gap-2">
          <History className="w-4 h-4 text-primary" />
          <span>Lanjut Nonton Donghua</span>
        </h2>
        <Link to="/donghua/history" className="flex items-center gap-1 text-xs text-primary hover:underline font-semibold">
          Lihat Semua <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
        {history.map((item, i) => (
          <motion.div
            key={item.episodeId || item.episodeSlug}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
            className="relative group shrink-0 w-28 sm:w-32"
          >
            <Link
              to={`/donghua/episode/${item.episodeId || item.episodeSlug}`}
              state={{ animeSlug: item.animeId || item.animeSlug, animeTitle: item.animeTitle, poster: item.poster }}
            >
              <div className="aspect-[3/4] rounded-xl overflow-hidden bg-secondary relative shadow-md">
                {item.poster ? (
                  <img
                    src={item.poster}
                    alt={item.animeTitle}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    onError={(e) => { e.target.style.display = "none"; }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-secondary">
                    <PlayCircle className="w-8 h-8 opacity-20" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 px-2 py-1.5">
                  <p className="text-[9px] text-white/70 truncate">{item.episodeTitle || "Episode"}</p>
                </div>
                {/* Play overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-10 h-10 rounded-full bg-primary/80 flex items-center justify-center shadow-lg">
                    <PlayCircle className="w-5 h-5 text-white" />
                  </div>
                </div>
              </div>
              <p className="text-xs font-semibold line-clamp-2 leading-tight mt-1.5 group-hover:text-primary transition-colors">
                {item.animeTitle}
              </p>
              <p className="text-[10px] text-muted-foreground">{timeAgo(item.watchedAt)}</p>
            </Link>

            {/* Remove button */}
            <button
              onClick={(e) => handleRemove(item.episodeId || item.episodeSlug, e)}
              className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-black/70 text-white/70 hover:text-white hover:bg-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all z-10"
            >
              <X className="w-2.5 h-2.5" />
            </button>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
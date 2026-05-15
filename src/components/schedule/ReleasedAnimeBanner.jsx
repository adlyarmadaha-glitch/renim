import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Bell, X, ChevronRight, Sparkles } from "lucide-react";
import { reminderStorage } from "@/lib/localStorage";
import { motion, AnimatePresence } from "framer-motion";

export default function ReleasedAnimeBanner() {
  const [notifs, setNotifs] = useState(() => reminderStorage.getReleasedNotifs().filter((n) => !n.seen));

  if (notifs.length === 0) return null;

  const dismiss = (animeId, e) => {
    e.preventDefault();
    e.stopPropagation();
    reminderStorage.markNotifSeen(animeId);
    setNotifs((prev) => prev.filter((n) => n.animeId !== animeId));
  };

  const dismissAll = () => {
    notifs.forEach((n) => reminderStorage.markNotifSeen(n.animeId));
    setNotifs([]);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-accent" />
          <span className="text-sm font-bold text-accent">Episode Baru — Anime Kamu!</span>
          <span className="px-1.5 py-0.5 rounded-full bg-accent text-white text-[10px] font-bold">{notifs.length}</span>
        </div>
        <button onClick={dismissAll} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
          Tutup semua
        </button>
      </div>
      <AnimatePresence>
        {notifs.slice(0, 3).map((n) => (
          <motion.div
            key={n.animeId}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: 40 }}
          >
            <Link to={`/anime/${encodeURIComponent(n.animeId)}`} onClick={() => reminderStorage.markNotifSeen(n.animeId)}>
              <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-gradient-to-r from-accent/15 to-primary/10 border border-accent/25 hover:border-accent/50 transition-all group">
                <Bell className="w-4 h-4 text-accent shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold line-clamp-1">{n.animeId.replace(/-sub-indo/g, "").replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase())}</p>
                  <p className="text-xs text-muted-foreground">{n.episodeTitle || "Episode baru sudah rilis!"}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-accent transition-colors shrink-0" />
                <button
                  onClick={(e) => dismiss(n.animeId, e)}
                  className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center hover:bg-destructive/20 transition-colors shrink-0"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </Link>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
import React, { useState, useEffect, useRef } from "react";
import { Bell, X, CheckCheck, Tv, TrendingUp, Info, BookOpen } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { animeApi } from "@/lib/animeApi";

const SEEN_KEY = "renime_notif_seen";
const CACHE_KEY = "renime_notif_cache";
const CACHE_TTL = 1000 * 60 * 10; // 10 minutes

function getSeenIds() {
  try { return JSON.parse(localStorage.getItem(SEEN_KEY) || "[]"); }
  catch { return []; }
}

function timeAgo(iso) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "baru saja";
  if (diff < 3600) return `${Math.floor(diff / 60)} menit lalu`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
  return `${Math.floor(diff / 86400)} hari lalu`;
}

// Build notifications from live API data (latest ongoing/trending)
async function fetchLiveNotifs() {
  try {
    const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || "null");
    if (cached && Date.now() - cached.fetchedAt < CACHE_TTL) return cached.notifs;

    const home = await animeApi.getHome();
    const ongoing = home?.data?.ongoing || [];
    const notifs = [];

    // Latest 3 ongoing as "new episode" notifs
    ongoing.slice(0, 3).forEach((anime, i) => {
      notifs.push({
        id: `ep_${anime.animeId}_${i}`,
        type: "new_episode",
        title: "Episode Baru!",
        body: `${anime.title} telah diperbarui dengan episode terbaru.`,
        animeId: anime.animeId,
        time: new Date(Date.now() - 1000 * 60 * (10 + i * 20)).toISOString(),
        icon: "tv",
        poster: anime.poster,
      });
    });

    // Trending notif from completed
    const completed = home?.data?.completed || [];
    if (completed[0]) {
      notifs.push({
        id: `trend_${completed[0].animeId}`,
        type: "trending",
        title: "Trending Sekarang",
        body: `${completed[0].title} sedang ramai ditonton minggu ini!`,
        animeId: completed[0].animeId,
        time: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
        icon: "trending",
        poster: completed[0].poster,
      });
    }

    // Static welcome notif
    notifs.push({
      id: "welcome_v2",
      type: "info",
      title: "Selamat Datang di Renime!",
      body: "Nikmati streaming anime & baca manga sub Indonesia gratis.",
      animeId: null,
      time: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      icon: "info",
    });

    localStorage.setItem(CACHE_KEY, JSON.stringify({ notifs, fetchedAt: Date.now() }));
    return notifs;
  } catch {
    return [
      {
        id: "welcome_v2",
        type: "info",
        title: "Selamat Datang di Renime!",
        body: "Nikmati streaming anime & baca manga sub Indonesia gratis.",
        animeId: null,
        time: new Date().toISOString(),
        icon: "info",
      },
    ];
  }
}

const IconMap = { tv: Tv, trending: TrendingUp, info: Info, manga: BookOpen };

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifs, setNotifs] = useState([]);
  const [seen, setSeen] = useState(getSeenIds);
  const [loading, setLoading] = useState(true);
  const ref = useRef(null);

  useEffect(() => {
    fetchLiveNotifs().then((n) => {
      setNotifs(n);
      setLoading(false);
    });
  }, []);

  // Refresh every 10 min when open
  useEffect(() => {
    if (!open) return;
    const interval = setInterval(() => {
      localStorage.removeItem(CACHE_KEY);
      fetchLiveNotifs().then(setNotifs);
    }, CACHE_TTL);
    return () => clearInterval(interval);
  }, [open]);

  const unread = notifs.filter((n) => !seen.includes(n.id)).length;

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const markAllRead = () => {
    const allIds = notifs.map((n) => n.id);
    localStorage.setItem(SEEN_KEY, JSON.stringify(allIds));
    setSeen(allIds);
  };

  const markOne = (id) => {
    const next = [...new Set([...seen, id])];
    localStorage.setItem(SEEN_KEY, JSON.stringify(next));
    setSeen(next);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative w-9 h-9 flex items-center justify-center rounded-xl hover:bg-secondary transition-colors"
        aria-label="Notifikasi"
      >
        <Bell className="w-5 h-5 text-foreground" />
        {unread > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-accent text-white text-[9px] font-extrabold rounded-full flex items-center justify-center leading-none">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="fixed md:absolute left-2 right-2 md:left-auto md:right-0 top-[68px] md:top-11 z-50 md:w-80 bg-card border border-border rounded-2xl shadow-2xl shadow-black/40 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <span className="text-sm font-bold">Notifikasi</span>
              <div className="flex items-center gap-2">
                {unread > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-xs text-primary hover:underline flex items-center gap-1"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    Tandai Semua
                  </button>
                )}
                <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* List */}
            <ul className="max-h-80 overflow-y-auto divide-y divide-border/60">
              {loading ? (
                <li className="py-8 text-center text-xs text-muted-foreground">
                  <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-2" />
                  Memuat notifikasi...
                </li>
              ) : notifs.length === 0 ? (
                <li className="py-10 text-center text-muted-foreground text-sm">Tidak ada notifikasi</li>
              ) : notifs.map((n) => {
                const Icon = IconMap[n.icon] || Bell;
                const isRead = seen.includes(n.id);
                const content = (
                  <div className={`flex gap-3 px-4 py-3 transition-colors ${isRead ? "opacity-60" : "bg-primary/5"}`}>
                    <div className={`shrink-0 w-8 h-8 rounded-xl flex items-center justify-center mt-0.5 ${
                      n.type === "new_episode" ? "bg-primary/15 text-primary" :
                      n.type === "trending" ? "bg-accent/15 text-accent" :
                      "bg-secondary text-muted-foreground"
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs font-bold leading-tight">{n.title}</p>
                        {!isRead && <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-0.5" />}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed line-clamp-2">{n.body}</p>
                      <p className="text-[10px] text-muted-foreground/60 mt-1">{timeAgo(n.time)}</p>
                    </div>
                  </div>
                );
                return (
                  <li key={n.id} className="hover:bg-secondary/50 transition-colors cursor-pointer">
                    {n.animeId ? (
                      <Link to={`/anime/${n.animeId}`} onClick={() => { markOne(n.id); setOpen(false); }}>
                        {content}
                      </Link>
                    ) : (
                      <div onClick={() => markOne(n.id)}>{content}</div>
                    )}
                  </li>
                );
              })}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
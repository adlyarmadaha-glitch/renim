import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Bell, BellRing, Check, PlayCircle, X, BookmarkCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getNotifications,
  getUnreadCount,
  markAllSeen,
  markSeen,
} from "@/lib/bookmarkNotifications";

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return "Baru saja";
  if (diff < 3600) return `${Math.floor(diff / 60)} mnt lalu`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
  return `${Math.floor(diff / 86400)} hari lalu`;
}

export default function BookmarkNotifPanel() {
  const [open, setOpen] = useState(false);
  const [notifs, setNotifs] = useState([]);
  const [unread, setUnread] = useState(0);

  const refresh = () => {
    setNotifs(getNotifications());
    setUnread(getUnreadCount());
  };

  useEffect(() => {
    refresh();
    const t = setInterval(refresh, 5000);
    return () => clearInterval(t);
  }, []);

  const handleOpen = () => {
    setOpen((v) => !v);
    if (!open) {
      setTimeout(() => { markAllSeen(); setUnread(0); }, 1500);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleOpen}
        className="relative w-9 h-9 flex items-center justify-center rounded-xl hover:bg-secondary transition-colors"
        title="Notifikasi Bookmark"
      >
        {unread > 0 ? (
          <motion.div animate={{ rotate: [0, -15, 15, -10, 10, 0] }} transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 3 }}>
            <BellRing className="w-5 h-5 text-primary" />
          </motion.div>
        ) : (
          <Bell className="w-5 h-5 text-muted-foreground" />
        )}
        {unread > 0 && (
          <motion.span
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-extrabold rounded-full flex items-center justify-center shadow"
          >
            {unread > 9 ? "9+" : unread}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              className="absolute right-0 top-full mt-2 w-80 bg-card border border-border rounded-2xl shadow-2xl shadow-black/50 z-50 overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <BookmarkCheck className="w-4 h-4 text-primary" />
                  <span className="text-sm font-bold">Notifikasi Bookmark</span>
                  {unread > 0 && (
                    <span className="px-1.5 py-0.5 text-[9px] font-extrabold bg-red-500 text-white rounded-full">{unread} baru</span>
                  )}
                </div>
                <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* List */}
              <div className="max-h-80 overflow-y-auto">
                {notifs.length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground">
                    <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                    <p className="text-sm">Belum ada notifikasi</p>
                    <p className="text-xs mt-1 opacity-60">Tambah bookmark anime untuk pantau update</p>
                  </div>
                ) : (
                  notifs.map((n) => (
                    <Link
                      key={n.id}
                      to={`/episode/${encodeURIComponent(n.episodeId)}`}
                      state={{ animeTitle: n.animeTitle, animeId: n.animeId, poster: n.poster }}
                      onClick={() => { markSeen(n.id); setOpen(false); refresh(); }}
                      className="flex items-start gap-3 px-4 py-3 hover:bg-secondary/60 transition-colors border-b border-border/50 last:border-0 group"
                    >
                      <div className="shrink-0">
                        {n.poster
                          ? <img src={n.poster} alt={n.animeTitle} className="w-10 h-14 object-cover rounded-lg" />
                          : <div className="w-10 h-14 bg-secondary rounded-lg flex items-center justify-center"><PlayCircle className="w-4 h-4 text-muted-foreground" /></div>
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors">{n.animeTitle}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">📺 {n.episodeTitle}</p>
                        <p className="text-[10px] text-muted-foreground/60 mt-1">{timeAgo(n.createdAt)}</p>
                      </div>
                      <PlayCircle className="w-4 h-4 text-primary shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  ))
                )}
              </div>

              {notifs.length > 0 && (
                <div className="px-4 py-2.5 border-t border-border">
                  <button
                    onClick={() => { markAllSeen(); setUnread(0); }}
                    className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors"
                  >
                    <Check className="w-3 h-3" /> Tandai semua sudah dibaca
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
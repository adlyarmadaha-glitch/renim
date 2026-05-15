import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Bell, BellOff, BellRing, Trash2, ExternalLink } from "lucide-react";
import { reminderStorage } from "@/lib/localStorage";
import { motion, AnimatePresence } from "framer-motion";

export default function RemindersSection() {
  const [list, setList] = useState(() => reminderStorage.list());
  const [notifs, setNotifs] = useState(() => reminderStorage.getReleasedNotifs());

  const remove = (animeId) => {
    reminderStorage.remove(animeId);
    setList(reminderStorage.list());
  };

  const dismissNotif = (animeId) => {
    reminderStorage.markNotifSeen(animeId);
    setNotifs(reminderStorage.getReleasedNotifs());
  };

  const clearAllNotifs = () => {
    reminderStorage.clearReleasedNotifs();
    setNotifs([]);
  };

  const unseenNotifs = notifs.filter((n) => !n.seen);

  return (
    <div className="space-y-4">
      {/* Notifikasi yang sudah rilis */}
      {unseenNotifs.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-accent flex items-center gap-1.5">
              <BellRing className="w-3.5 h-3.5" />
              Episode Baru Rilis ({unseenNotifs.length})
            </p>
            <button onClick={clearAllNotifs} className="text-[10px] text-muted-foreground hover:text-destructive transition-colors">
              Hapus semua
            </button>
          </div>
          <AnimatePresence>
            {unseenNotifs.map((n) => (
              <motion.div
                key={n.animeId}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="flex items-center gap-2.5 p-2.5 rounded-xl bg-accent/10 border border-accent/25"
              >
                <BellRing className="w-3.5 h-3.5 text-accent shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold line-clamp-1">{n.episodeTitle}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {new Date(n.releasedAt).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                  </p>
                </div>
                <Link
                  to={`/anime/${encodeURIComponent(n.animeId)}`}
                  onClick={() => dismissNotif(n.animeId)}
                  className="px-2 py-1 rounded-lg bg-accent/20 text-accent text-[10px] font-semibold hover:bg-accent/30 transition-colors shrink-0"
                >
                  Tonton
                </Link>
                <button onClick={() => dismissNotif(n.animeId)} className="w-6 h-6 rounded-lg hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors shrink-0">
                  ×
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Daftar reminder */}
      {list.length === 0 ? (
        <div className="text-center py-8">
          <Bell className="w-10 h-10 text-muted-foreground/20 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Belum ada pengingat</p>
          <p className="text-xs text-muted-foreground/60 mt-1">
            Pergi ke{" "}
            <Link to="/jadwal" className="text-primary hover:underline">
              Jadwal
            </Link>{" "}
            dan tekan 🔔 pada anime
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">{list.length} anime dipantau</p>
          {list.map((r) => (
            <div key={r.animeId} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/60 border border-border">
              {r.poster && (
                <img src={r.poster} alt={r.title} className="w-9 h-12 rounded-lg object-cover shrink-0 ring-1 ring-border" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold line-clamp-1">{r.title}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
                  <Bell className="w-2.5 h-2.5" />
                  Aktif · Ditambah {new Date(r.addedAt).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                </p>
              </div>
              <Link
                to={`/anime/${encodeURIComponent(r.animeId)}`}
                className="w-7 h-7 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 flex items-center justify-center transition-colors shrink-0"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
              <button
                onClick={() => remove(r.animeId)}
                className="w-7 h-7 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 flex items-center justify-center transition-colors shrink-0"
              >
                <BellOff className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
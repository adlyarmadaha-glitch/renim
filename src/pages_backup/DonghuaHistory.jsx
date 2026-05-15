import React, { useState } from "react";
import { Link } from "react-router-dom";
import { donghuaStorage } from "@/lib/donghuaApi";
import { Button } from "@/components/ui/button";
import { Tv2, Trash2, Clock, ArrowLeft, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function timeAgo(date) {
  const diff = (Date.now() - new Date(date)) / 1000;
  if (diff < 60) return "Baru saja";
  if (diff < 3600) return `${Math.floor(diff / 60)} menit lalu`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
  return `${Math.floor(diff / 86400)} hari lalu`;
}

export default function DonghuaHistory() {
  const [history, setHistory] = useState(() => donghuaStorage.getHistory());

  const handleRemove = (episodeId) => {
    donghuaStorage.removeHistory(episodeId);
    setHistory(donghuaStorage.getHistory());
  };

  const handleClear = () => {
    donghuaStorage.clearHistory();
    setHistory([]);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button onClick={() => window.history.back()} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-heading font-extrabold flex items-center gap-2">🐉 Riwayat Donghua</h1>
            <p className="text-xs text-muted-foreground">{history.length} tontonan</p>
          </div>
        </div>
        {history.length > 0 && (
          <Button variant="outline" size="sm" onClick={handleClear} className="gap-1.5 text-destructive hover:text-destructive border-destructive/30 hover:bg-destructive/10">
            <Trash2 className="w-3.5 h-3.5" /> Hapus Semua
          </Button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Tv2 className="w-14 h-14 mx-auto mb-4 opacity-10" />
          <p className="font-semibold">Belum ada riwayat</p>
          <p className="text-xs mt-1 mb-4">Tonton donghua untuk mulai melacak history</p>
          <Link to="/donghua">
            <Button size="sm" className="gap-2">🐉 Jelajahi Donghua</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {history.map((h, i) => (
              <motion.div key={h.episodeId || i}
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
                transition={{ delay: i * 0.03 }}
                className="bg-card border border-border rounded-xl p-3 flex items-center gap-3 hover:border-primary/30 transition-colors group">
                <div className="w-12 h-16 rounded-lg overflow-hidden bg-secondary shrink-0">
                  {h.poster ? (
                    <img src={h.poster} alt={h.animeTitle} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><Tv2 className="w-5 h-5 opacity-20" /></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-extrabold text-primary/80 truncate">🐉 {h.animeTitle}</p>
                  <p className="text-sm font-semibold truncate">{h.episodeTitle || h.episodeId}</p>
                  <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                    <Clock className="w-2.5 h-2.5" />{timeAgo(h.watchedAt)}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <Link to={`/donghua/episode/${h.episodeId}`}
                    state={{ animeSlug: h.animeId, animeTitle: h.animeTitle, poster: h.poster }}>
                    <Button size="sm" variant="outline" className="gap-1 text-xs h-8 hover:bg-primary/10 hover:border-primary/40 hover:text-primary">
                      <RotateCcw className="w-3 h-3" /> Lanjut
                    </Button>
                  </Link>
                  <button onClick={() => handleRemove(h.episodeId)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
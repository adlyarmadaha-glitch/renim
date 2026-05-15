import React, { useState } from "react";
import { Link } from "react-router-dom";
import { mangaHistoryStorage } from "@/lib/mangaApi";
import { Button } from "@/components/ui/button";
import { BookOpen, Trash2, Clock, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function MangaHistory() {
  const [history, setHistory] = useState(() => mangaHistoryStorage.list());

  const handleRemove = (mangaSlug) => {
    const list = history.filter((h) => h.mangaSlug !== mangaSlug);
    localStorage.setItem("renime_manga_history", JSON.stringify(list));
    setHistory(list);
  };

  const handleClearAll = () => {
    mangaHistoryStorage.clear();
    setHistory([]);
  };

  const timeAgo = (iso) => {
    if (!iso) return "";
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return "Baru saja";
    if (m < 60) return `${m} menit lalu`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h} jam lalu`;
    const d = Math.floor(h / 24);
    if (d < 7) return `${d} hari lalu`;
    return new Date(iso).toLocaleDateString("id-ID");
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-heading font-extrabold flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" /> Riwayat Baca Manga
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">{history.length} manga terbaca</p>
        </div>
        {history.length > 0 && (
          <Button variant="outline" size="sm" onClick={handleClearAll}
            className="gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/10">
            <Trash2 className="w-3.5 h-3.5" /> Hapus Semua
          </Button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto">
            <BookOpen className="w-7 h-7 text-muted-foreground/40" />
          </div>
          <p className="text-muted-foreground text-sm">Belum ada riwayat baca</p>
          <Link to="/manga">
            <Button size="sm" variant="outline" className="gap-1.5">
              <BookOpen className="w-3.5 h-3.5" /> Mulai Baca Manga
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {history.map((item) => (
              <motion.div
                key={item.mangaSlug || item.chapterSlug}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 16, height: 0 }}
                className="flex items-center gap-3 bg-card border border-border rounded-xl p-3 group hover:border-primary/30 transition-all"
              >
                {/* Poster */}
                <div className="w-12 h-16 rounded-lg overflow-hidden bg-secondary shrink-0 border border-border">
                  {item.poster ? (
                    <img src={item.poster} alt={item.title} className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-muted-foreground/30" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <Link to={`/manga/${item.mangaSlug}`}>
                    <p className="font-semibold text-sm hover:text-primary transition-colors truncate">{item.title || item.mangaSlug}</p>
                  </Link>
                  <p className="text-xs text-primary mt-0.5 truncate">{item.chapterTitle || item.chapterSlug}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" />{timeAgo(item.readAt)}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <Link to={`/manga/chapter/${item.chapterSlug}`}>
                    <Button size="sm" variant="outline" className="text-xs h-7 px-2.5 gap-1 hover:bg-primary/10 hover:border-primary/40 hover:text-primary">
                      <BookOpen className="w-3 h-3" /> Lanjut
                    </Button>
                  </Link>
                  <button
                    onClick={() => handleRemove(item.mangaSlug)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    title="Hapus dari riwayat"
                  >
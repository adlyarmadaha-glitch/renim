import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Filter, X, RotateCcw, ChevronDown, Tag, Clock, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { animeApi } from "@/lib/animeApi";

const GENRES = [
  "Action","Adventure","Comedy","Drama","Fantasy","Horror","Isekai","Magic",
  "Mecha","Military","Mystery","Romance","School","Sci-Fi","Slice of Life",
  "Sports","Supernatural","Thriller","Psychological","Historical","Vampire",
  "Demons","Superpower","Martial Arts","Music","Game","Kids","Josei","Seinen",
  "Shoujo","Shounen",
];

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 20 }, (_, i) => CURRENT_YEAR - i);

export default function AnimeFilterSidebar({ filters, onChange }) {
  const [open, setOpen] = useState(false);

  const { data: genreData } = useQuery({
    queryKey: ["genres"],
    queryFn: () => animeApi.getGenres(),
    staleTime: 1000 * 60 * 30,
  });

  const rawGenres = genreData?.data;
  const genres = (Array.isArray(rawGenres) && rawGenres.length > 0)
    ? rawGenres.map((g) => ({
        name: g.title || g.name || g,
        slug: g.slug || g.genreId || (g.title || g.name || g).toLowerCase().replace(/\s+/g, "-"),
      }))
    : GENRES.map((g) => ({ name: g, slug: g.toLowerCase().replace(/\s+/g, "-") }));

  const activeCount = [filters.genre, filters.status, filters.year].filter(Boolean).length;

  const toggle = (key, val) => {
    onChange({ ...filters, [key]: filters[key] === val ? "" : val });
  };

  const reset = () => onChange({ genre: "", status: "", year: "" });

  return (
    <div className="relative">
      {/* Trigger */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
          activeCount > 0
            ? "bg-primary/15 border-primary/40 text-primary"
            : "bg-secondary border-border text-muted-foreground hover:text-foreground hover:border-border/80"
        }`}
      >
        <Filter className="w-4 h-4" />
        Filter
        {activeCount > 0 && (
          <span className="w-5 h-5 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center">
            {activeCount}
          </span>
        )}
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full mt-2 left-0 z-40 w-80 bg-card border border-border rounded-2xl shadow-2xl shadow-black/60 p-5 space-y-5"
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-primary" />
                  <span className="font-bold text-sm">Filter Anime</span>
                </div>
                <div className="flex items-center gap-2">
                  {activeCount > 0 && (
                    <button onClick={reset} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors">
                      <RotateCcw className="w-3 h-3" /> Reset
                    </button>
                  )}
                  <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Status */}
              <div>
                <div className="flex items-center gap-1.5 mb-2.5">
                  <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Status</span>
                </div>
                <div className="flex gap-2">
                  {[
                    { val: "ongoing", label: "🔴 Ongoing" },
                    { val: "completed", label: "✅ Completed" },
                  ].map((s) => (
                    <button
                      key={s.val}
                      onClick={() => toggle("status", s.val)}
                      className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all ${
                        filters.status === s.val
                          ? "bg-primary/15 border-primary/40 text-primary"
                          : "bg-secondary border-border text-muted-foreground hover:border-border/80 hover:text-foreground"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Year */}
              <div>
                <div className="flex items-center gap-1.5 mb-2.5">
                  <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Tahun Rilis</span>
                </div>
                <div className="grid grid-cols-4 gap-1.5 max-h-28 overflow-y-auto scrollbar-hide pr-0.5">
                  {YEARS.map((y) => (
                    <button
                      key={y}
                      onClick={() => toggle("year", String(y))}
                      className={`py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                        filters.year === String(y)
                          ? "bg-primary/15 border-primary/40 text-primary"
                          : "bg-secondary border-border text-muted-foreground hover:border-border/80 hover:text-foreground"
                      }`}
                    >
                      {y}
                    </button>
                  ))}
                </div>
              </div>

              {/* Genre */}
              <div>
                <div className="flex items-center gap-1.5 mb-2.5">
                  <Tag className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Genre</span>
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto scrollbar-hide pr-0.5">
                  {genres.map((g) => (
                    <button
                      key={g.slug}
                      onClick={() => toggle("genre", g.slug)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all ${
                        filters.genre === g.slug
                          ? "bg-primary/15 border-primary/40 text-primary"
                          : "bg-secondary border-border text-muted-foreground hover:border-border/80 hover:text-foreground"
                      }`}
                    >
                      {g.name}
                    </button>
                  ))}
                </div>
              </div>

              <Button
                className="w-full"
                onClick={() => setOpen(false)}
              >
                Terapkan Filter
              </Button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
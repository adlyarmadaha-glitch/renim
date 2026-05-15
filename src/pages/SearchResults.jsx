import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { animeApi } from "@/lib/animeApi";
import AnimeGrid from "@/components/anime/AnimeGrid";
import { AnimeGridSkeleton } from "@/components/anime/LoadingSkeleton";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, TrendingUp, Clock, Sparkles } from "lucide-react";

const POPULAR_SEARCHES = [
  "Conan", "Naruto", "One Piece", "Attack on Titan", "Demon Slayer",
  "Jujutsu Kaisen", "Bleach", "Dragon Ball", "Fairy Tail", "Hunter x Hunter"
];

function EmptyState({ query }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center py-16 select-none text-center">
      <motion.div className="text-7xl mb-4"
        animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.05, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      >😢</motion.div>
      <h3 className="text-lg font-bold text-foreground mb-2">Tidak Ditemukan</h3>
      <p className="text-sm text-muted-foreground max-w-xs">
        Anime "<span className="text-foreground font-semibold">{query}</span>" tidak ada.<br />
        Coba kata kunci lain yang lebih umum.
      </p>
      <div className="mt-6">
        <p className="text-xs text-muted-foreground mb-3 flex items-center justify-center gap-1">
          <TrendingUp className="w-3 h-3" /> Coba pencarian populer:
        </p>
        <div className="flex flex-wrap gap-2 justify-center">
          {POPULAR_SEARCHES.slice(0, 6).map((s) => (
            <a key={s} href={`/cari?q=${encodeURIComponent(s)}`}
              className="px-3 py-1.5 bg-secondary hover:bg-primary/15 hover:text-primary text-xs rounded-full border border-border hover:border-primary/30 transition-all font-medium">
              {s}
            </a>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default function SearchResults() {
  const location = useLocation();
  const navigate = useNavigate();
  const query = new URLSearchParams(location.search).get("q") || "";
  const [inputVal, setInputVal] = useState(query);
  const [focused, setFocused] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => { setInputVal(query); }, [query]);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["search", query],
    queryFn: () => animeApi.search(query),
    enabled: query.length >= 2,
  });

  const handleSearch = (e) => {
    e.preventDefault();
    const q = inputVal.trim();
    if (!q) return;
    navigate(`/cari?q=${encodeURIComponent(q)}`);
    setFocused(false);
    inputRef.current?.blur();
  };

  const results = data?.data?.animeList || [];
  const loading = isLoading || isFetching;

  return (
    <div className="space-y-6">
      {/* Search bar — improved UI */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm py-2 -mx-3 sm:-mx-4 px-3 sm:px-4 border-b border-border/50">
        <form onSubmit={handleSearch}>
          <div className={`relative flex items-center bg-secondary rounded-2xl border transition-all duration-200 ${
            focused ? "border-primary shadow-lg shadow-primary/10 ring-2 ring-primary/20" : "border-transparent"
          }`}>
            <Search className="w-5 h-5 text-muted-foreground ml-4 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Cari anime... (contoh: Conan, Naruto)"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              className="flex-1 bg-transparent px-3 py-3 text-sm focus:outline-none placeholder:text-muted-foreground/60"
              autoFocus
            />
            <AnimatePresence>
              {inputVal && (
                <motion.button
                  type="button"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => { setInputVal(""); inputRef.current?.focus(); }}
                  className="p-2 mr-1 rounded-xl text-muted-foreground hover:text-foreground hover:bg-card transition-colors"
                >
                  <X className="w-4 h-4" />
                </motion.button>
              )}
            </AnimatePresence>
            <button type="submit"
              className="shrink-0 mr-2 px-4 py-2 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-colors disabled:opacity-50"
              disabled={!inputVal.trim()}>
              Cari
            </button>
          </div>
        </form>
      </div>

      {/* No query — show popular */}
      {!query && (
        <div className="space-y-6 py-4">
          <div>
            <h2 className="text-sm font-bold flex items-center gap-2 mb-3 text-muted-foreground">
              <TrendingUp className="w-4 h-4" /> Pencarian Populer
            </h2>
            <div className="flex flex-wrap gap-2">
              {POPULAR_SEARCHES.map((s) => (
                <button key={s} onClick={() => navigate(`/cari?q=${encodeURIComponent(s)}`)}
                  className="px-3 py-2 bg-secondary hover:bg-primary/15 hover:text-primary text-sm rounded-xl border border-border hover:border-primary/30 transition-all font-medium flex items-center gap-1.5">
                  <Search className="w-3.5 h-3.5 text-muted-foreground" />
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Query info */}
      {query && (
        <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            Hasil pencarian untuk
          </div>
          <h1 className="text-xl font-heading font-bold">"{query}"</h1>
          {!loading && (
            <p className="text-sm text-muted-foreground mt-1">
              {results.length > 0
                ? <><span className="text-foreground font-semibold">{results.length}</span> anime ditemukan</>
                : "Tidak ada hasil"}
            </p>
          )}
        </motion.div>
      )}

      {/* Results */}
      {query && (
        loading ? (
          <AnimeGridSkeleton />
        ) : results.length === 0 ? (
          <EmptyState query={query} />
        ) : (
          <AnimeGrid animeList={results} />
        )
      )}
    </div>
  );
}
import React, { useState, useCallback, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { donghuaApi } from "@/lib/donghuaApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Star, ChevronDown, Tv2, Eye, X, ChevronUp, Filter, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { donghuaSeenNew } from "@/lib/donghuaApi";
import ContinueWatchingDonghua from "@/components/donghua/ContinueWatchingDonghua";

// ── Card ─────────────────────────────────────────────────────────────────────
function DonghuaCard({ item }) {
  const isOngoing = (item.status || "").toLowerCase().includes("ongoing")
    || (item.status || "").toLowerCase().includes("airing");
  const isCompleted = (item.status || "").toLowerCase().includes("completed")
    || (item.status || "").toLowerCase().includes("tamat");

  const href = item.episodeSlug
    ? `/donghua/episode/${item.episodeSlug}`
    : `/donghua/${item.slug}`;
  const state = item.episodeSlug
    ? { animeSlug: item.slug, animeTitle: item.title, poster: item.poster }
    : {};

  const newKey = item.episodeSlug || item.slug || item.title;
  const isNew = !donghuaSeenNew.isSeen(newKey);

  return (
    <Link to={href} state={state} onClick={() => { if (isNew) donghuaSeenNew.markSeen(newKey); }}>
      <div className="group relative">
        <div className="aspect-[3/4] rounded-xl overflow-hidden bg-secondary relative shadow-md">
          {item.poster ? (
            <img src={item.poster} alt={item.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy" referrerPolicy="no-referrer"
              onError={(e) => { e.target.style.display = "none"; }} />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Tv2 className="w-10 h-10 text-muted-foreground/20" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-70 group-hover:opacity-90 transition-opacity" />

          {isNew && (
            <div className="absolute top-1.5 left-1.5 z-10">
              <span className="text-[8px] font-extrabold px-1.5 py-0.5 rounded text-white shadow-sm bg-green-500">NEW</span>
            </div>
          )}
          <div className={`absolute ${isNew ? "top-7" : "top-1.5"} left-1.5`}>
            <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded text-white shadow-sm ${
              isOngoing ? "bg-green-600" : isCompleted ? "bg-blue-600" : "bg-zinc-600"
            }`}>
              {isOngoing ? "ON-AIR" : isCompleted ? "TAMAT" : (item.type || "DONGHUA")}
            </span>
          </div>

          {item.score && (
            <div className="absolute top-1.5 right-1.5 flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-black/70 text-yellow-400 text-[9px] font-bold">
              <Star className="w-2 h-2 fill-current" />{item.score}
            </div>
          )}

          {item.views > 0 && (
            <div className="absolute bottom-0 left-0 right-0 px-2 py-1.5">
              <p className="text-[9px] text-white/70 flex items-center gap-0.5">
                <Eye className="w-2 h-2" />{(item.views / 1000).toFixed(0)}K
              </p>
            </div>
          )}
        </div>
        <div className="mt-1.5 space-y-0.5">
          <p className="text-xs font-semibold line-clamp-2 leading-tight group-hover:text-primary transition-colors">{item.title}</p>
          {item.ep && item.ep !== "Ongoing" && item.ep !== "Completed" && (
            <p className="text-[10px] text-muted-foreground/60 truncate">{item.ep}</p>
          )}
        </div>
      </div>
    </Link>
  );
}

function GridSkeleton() {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
      {Array(18).fill(0).map((_, i) => (
        <div key={i}>
          <Skeleton className="aspect-[3/4] rounded-xl" />
          <Skeleton className="h-3 w-3/4 mt-1.5" />
        </div>
      ))}
    </div>
  );
}

const STATIC_GENRES = [
  { name: "Action", slug: "action" }, { name: "Adventure", slug: "adventure" },
  { name: "Cultivation", slug: "cultivation" }, { name: "Fantasy", slug: "fantasy" },
  { name: "Martial Arts", slug: "martial-arts" }, { name: "Romance", slug: "romance" },
  { name: "Comedy", slug: "comedy" }, { name: "Drama", slug: "drama" },
  { name: "Historical", slug: "historical" }, { name: "Isekai", slug: "isekai" },
  { name: "Reincarnation", slug: "reincarnation" }, { name: "Magic", slug: "magic" },
  { name: "School", slug: "school" }, { name: "Slice of Life", slug: "slice-of-life" },
  { name: "Supernatural", slug: "supernatural" }, { name: "Mystery", slug: "mystery" },
];

// ── Infinite list for Ongoing / Completed / Genre ──────────────────────────
function InfiniteTabList({ fetchFn, queryKey }) {
  const [pages, setPages] = useState([1]);
  const [items, setItems] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [initialLoaded, setInitialLoaded] = useState(false);

  // Load page 1 on mount / queryKey change
  React.useEffect(() => {
    let cancelled = false;
    setItems([]);
    setPages([1]);
    setHasMore(true);
    setInitialLoaded(false);
    fetchFn(1).then((res) => {
      if (cancelled) return;
      setItems(res.list || []);
      setHasMore(res.hasMore !== false && (res.list || []).length > 0);
      setInitialLoaded(true);
    });
    return () => { cancelled = true; };
  }, [queryKey]);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    const nextPage = pages[pages.length - 1] + 1;
    const res = await fetchFn(nextPage);
    const newItems = res.list || [];
    setItems((prev) => [...prev, ...newItems]);
    setHasMore(res.hasMore !== false && newItems.length > 0);
    setPages((prev) => [...prev, nextPage]);
    setLoading(false);
  }, [loading, hasMore, pages, fetchFn]);

  if (!initialLoaded) return <GridSkeleton />;

  if (items.length === 0) return (
    <div className="text-center py-20 text-muted-foreground">
      <Tv2 className="w-12 h-12 mx-auto mb-3 opacity-20" />
      <p className="text-sm">Tidak ada konten ditemukan</p>
    </div>
  );

  return (
    <>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
        {items.map((item, i) => (
          <motion.div key={(item.episodeSlug || item.slug || "") + i}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(i * 0.015, 0.25) }}>
            <DonghuaCard item={item} />
          </motion.div>
        ))}
      </div>
      {hasMore && (
        <div className="flex justify-center pt-4">
          <Button variant="outline" size="sm" onClick={loadMore} disabled={loading}
            className="gap-2 hover:bg-primary/10 hover:border-primary/40 hover:text-primary min-w-[160px]">
            {loading
              ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />Memuat...</>
              : <><ChevronDown className="w-3.5 h-3.5" />Muat Lebih Banyak</>}
          </Button>
        </div>
      )}
      {!hasMore && items.length > 0 && (
        <p className="text-center text-xs text-muted-foreground py-3">✅ Semua konten telah dimuat ({items.length} total)</p>
      )}
    </>
  );
}

export default function DonghuaList() {
  const [tab, setTab] = useState("terbaru");
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeGenre, setActiveGenre] = useState(null); // { name, slug }
  const [showGenres, setShowGenres] = useState(false);
  const [showAllGenres, setShowAllGenres] = useState(false);

  // ── Queries ─────────────────────────────────────────────────────────────────
  const { data: homeData, isLoading: lHome } = useQuery({
    queryKey: ["donghua-home-v2"],
    queryFn: () => donghuaApi.getHome(),
    staleTime: 1000 * 60 * 3,
    enabled: tab === "terbaru" && !searchQuery && !activeGenre,
  });

  const { data: searchData, isLoading: lSearch } = useQuery({
    queryKey: ["donghua-search-v2", searchQuery],
    queryFn: () => donghuaApi.search(searchQuery),
    enabled: !!searchQuery,
    staleTime: 1000 * 60 * 5,
  });

  const { data: genreData = [] } = useQuery({
    queryKey: ["donghua-genres-v2"],
    queryFn: () => donghuaApi.getGenres(),
    staleTime: 1000 * 60 * 60,
  });
  const genres = genreData.length > 0 ? genreData : STATIC_GENRES;
  const visibleGenres = showAllGenres ? genres : genres.slice(0, 16);

  const handleSearch = (e) => {
    e.preventDefault();
    const q = searchInput.trim();
    if (!q) return;
    setSearchQuery(q);
    setActiveGenre(null);
  };

  const clearSearch = () => { setSearchQuery(""); setSearchInput(""); setActiveGenre(null); };

  const handleTabChange = (t) => {
    setTab(t);
    setActiveGenre(null);
    setSearchQuery("");
    setSearchInput("");
  };

  const handleGenreClick = (g) => {
    setActiveGenre(g);
    setShowGenres(false);
    setSearchQuery("");
    setSearchInput("");
  };

  // ── Derive display mode ──────────────────────────────────────────────────────
  const isSearch = !!searchQuery;
  const isGenre = !!activeGenre && !searchQuery;
  const isTerbaru = tab === "terbaru" && !isSearch && !isGenre;
  const isOngoing = tab === "ongoing" && !isSearch && !isGenre;
  const isCompleted = tab === "selesai" && !isSearch && !isGenre;

  return (
    <div className="space-y-5">
      <ContinueWatchingDonghua />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-heading font-extrabold flex items-center gap-2">🐉 Donghua</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Animasi China Sub Indo</p>
        </div>
        <form onSubmit={handleSearch} className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input placeholder="Cari donghua..." value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)} className="pl-8 h-9 text-sm" />
          </div>
          <Button type="submit" size="sm">Cari</Button>
          {(searchQuery || activeGenre) && (
            <Button type="button" variant="ghost" size="sm" onClick={clearSearch}>
              <X className="w-4 h-4" />
            </Button>
          )}
        </form>
      </div>

      {/* Tabs + Genre toggle */}
      {!isSearch && (
        <div className="flex items-center gap-2 flex-wrap">
          {[
            { key: "terbaru", label: "🕐 Terbaru" },
            { key: "ongoing", label: "🔥 Ongoing" },
            { key: "selesai", label: "✅ Selesai" },
          ].map((t) => (
            <button key={t.key} onClick={() => handleTabChange(t.key)}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                tab === t.key && !isGenre
                  ? "bg-primary text-white border-primary shadow-md shadow-primary/30"
                  : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/30"
              }`}>
              {t.label}
            </button>
          ))}

          <button onClick={() => setShowGenres((v) => !v)}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold border transition-all ${
              showGenres || isGenre
                ? "bg-primary/15 border-primary/50 text-primary"
                : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/30"
            }`}>
            <Filter className="w-3 h-3" />
            Genre
            {isGenre && (
              <span onClick={(e) => { e.stopPropagation(); clearSearch(); }}
                className="ml-0.5 w-4 h-4 rounded-full bg-primary/30 hover:bg-primary/60 flex items-center justify-center">
                <X className="w-2.5 h-2.5" />
              </span>
            )}
          </button>

          {isGenre && (
            <span className="text-xs px-3 py-1 bg-primary/10 text-primary rounded-xl border border-primary/30 font-semibold">
              {activeGenre.name}
            </span>
          )}
        </div>
      )}

      {/* Genre panel */}
      <AnimatePresence>
        {showGenres && !isSearch && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden">
            <div className="bg-card border border-border rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Pilih Genre</p>
                <button onClick={() => setShowGenres(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {visibleGenres.map((g) => (
                  <button key={g.slug} onClick={() => handleGenreClick(g)}
                    className={`px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all border ${
                      activeGenre?.slug === g.slug
                        ? "bg-primary text-white border-primary shadow-sm"
                        : "border-border text-muted-foreground hover:border-primary/50 hover:text-primary bg-secondary/60"
                    }`}>
                    {g.name}
                  </button>
                ))}
              </div>
              {genres.length > 16 && (
                <button onClick={() => setShowAllGenres((v) => !v)}
                  className="mt-2.5 flex items-center gap-1 text-[11px] text-muted-foreground hover:text-primary transition-colors">
                  {showAllGenres
                    ? <><ChevronUp className="w-3 h-3" /> Sembunyikan</>
                    : <><ChevronDown className="w-3 h-3" /> +{genres.length - 16} genre lainnya</>}
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search info */}
      {isSearch && (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Hasil: <span className="text-foreground font-semibold">"{searchQuery}"</span></span>
          {searchData?.list && <span className="text-muted-foreground text-xs">({searchData.list.length} hasil)</span>}
          <button onClick={clearSearch} className="text-xs text-primary hover:underline">Reset</button>
        </div>
      )}

      {/* ── Content area ──────────────────────────────────────────────────────── */}

      {/* Search results */}
      {isSearch && (
        lSearch ? <GridSkeleton /> : (
          (searchData?.list || []).length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <Tv2 className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p className="text-sm">Tidak ada donghua ditemukan untuk "{searchQuery}"</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
              {(searchData?.list || []).map((item, i) => (
                <motion.div key={(item.episodeSlug || item.slug || "") + i}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.02, 0.3) }}>
                  <DonghuaCard item={item} />
                </motion.div>
              ))}
            </div>
          )
        )
      )}

      {/* Terbaru (home) */}
      {isTerbaru && (
        lHome ? <GridSkeleton /> : (
          (homeData?.latestRelease || []).length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <Tv2 className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p className="text-sm">Memuat konten terbaru...</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
              {(homeData?.latestRelease || []).map((item, i) => (
                <motion.div key={(item.episodeSlug || item.slug || "") + i}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.02, 0.3) }}>
                  <DonghuaCard item={item} />
                </motion.div>
              ))}
            </div>
          )
        )
      )}

      {/* Ongoing — infinite */}
      {isOngoing && (
        <InfiniteTabList
          key="ongoing"
          fetchFn={donghuaApi.getOngoing.bind(donghuaApi)}
          queryKey="ongoing"
        />
      )}

      {/* Selesai — infinite */}
      {isCompleted && (
        <InfiniteTabList
          key="completed"
          fetchFn={donghuaApi.getCompleted.bind(donghuaApi)}
          queryKey="completed"
        />
      )}

      {/* Genre — infinite */}
      {isGenre && (
        <InfiniteTabList
          key={`genre-${activeGenre.slug}`}
          fetchFn={(page) => donghuaApi.getGenreAnime(activeGenre.slug, page)}
          queryKey={`genre-${activeGenre.slug}`}
        />
      )}
    </div>
  );
}
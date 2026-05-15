import React from "react";
import { Link } from "react-router-dom";
import { Flame, Star, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { animeApi } from "@/lib/animeApi";
import { Skeleton } from "@/components/ui/skeleton";

const RANK_STYLES = [
  "from-yellow-500 to-amber-400 text-black shadow-yellow-500/40",
  "from-slate-400 to-slate-300 text-black shadow-slate-400/30",
  "from-amber-700 to-amber-600 text-white shadow-amber-600/30",
];

// Fallback static list jika API gagal
// Fallback pakai samehadaku prefix agar link detail benar
const FALLBACK = [
  { animeId: "samehadaku:one-piece",                      title: "One Piece",               poster: "https://cdn.myanimelist.net/images/anime/6/73245.jpg",   score: "8.9" },
  { animeId: "samehadaku:gachiakuta",                     title: "Gachiakuta",              poster: "https://v2.samehadaku.how/wp-content/uploads/2025/07/150432.jpg", score: "8.2" },
  { animeId: "samehadaku:sakamoto-days-cour-2",           title: "Sakamoto Days Cour 2",    poster: "https://v2.samehadaku.how/wp-content/uploads/2025/07/bx184237-OJAksU2fsIPx.jpg", score: "7.9" },
  { animeId: "samehadaku:kaijuu-8-gou-season-2",          title: "Kaijuu 8-gou Season 2",   poster: "https://v2.samehadaku.how/wp-content/uploads/2025/07/150344.jpg", score: "7.8" },
  { animeId: "samehadaku:one-punch-man-season-3",         title: "One Punch Man Season 3",  poster: "https://v2.samehadaku.how/wp-content/uploads/2025/10/148347.jpg", score: "8.5" },
  { animeId: "samehadaku:dandadan-season-2",              title: "Dandadan Season 2",       poster: "https://v2.samehadaku.how/wp-content/uploads/2025/07/149001.jpg", score: "8.5" },
  { animeId: "samehadaku:tougen-anki",                    title: "Tougen Anki",             poster: "https://v2.samehadaku.how/wp-content/uploads/2025/07/Tougen-Anki.jpg", score: "7.2" },
  { animeId: "samehadaku:tensei-shitara-dainana-ouji-s2", title: "Tensei Dainana Ouji S2",  poster: "https://v2.samehadaku.how/wp-content/uploads/2025/07/Tensei-shitara-Dainana-Ouji-Season-2.jpg", score: "7.5" },
  { animeId: "samehadaku:shingeki-no-kyojin",             title: "Attack on Titan",         poster: "https://cdn.myanimelist.net/images/anime/10/47347.jpg",   score: "9.0" },
  { animeId: "samehadaku:death-note",                     title: "Death Note",              poster: "https://cdn.myanimelist.net/images/anime/9/9453.jpg",     score: "8.6" },
];

function TopListSkeleton() {
  return (
    <div className="space-y-2">
      {Array(10).fill(0).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-xl bg-secondary/40">
          <Skeleton className="w-7 h-7 rounded-lg shrink-0" />
          <Skeleton className="w-10 h-14 rounded-lg shrink-0" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3.5 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="w-10 h-4" />
        </div>
      ))}
    </div>
  );
}

export default function TopList() {
  const { data, isLoading } = useQuery({
    queryKey: ["popular-anime-v2"],
    queryFn: () => animeApi.getPopular(1),
    staleTime: 1000 * 60 * 10,
  });

  const rawList = data?.data?.animeList || [];
  const list    = (rawList.length >= 5 ? rawList : FALLBACK).slice(0, 10).map((a, i) => ({
    ...a,
    rank: i + 1,
  }));

  return (
    <section>
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-xl bg-accent/15 flex items-center justify-center">
          <Flame className="w-4 h-4 text-accent" />
        </div>
        <h2 className="text-xl font-heading font-bold">Hot Anime</h2>
        <span className="text-[10px] text-muted-foreground ml-auto bg-secondary px-2 py-1 rounded-full flex items-center gap-1.5">
          <TrendingUp className="w-3 h-3 text-accent" />
          Paling Banyak Ditonton
        </span>
      </div>

      {isLoading ? (
        <TopListSkeleton />
      ) : (
        <div className="space-y-2">
          {list.map((anime, i) => {
            const isTop3 = anime.rank <= 3;
            return (
              <motion.div
                key={anime.animeId || i}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <Link to={`/anime/${anime.animeId}`}>
                  <div className={`relative flex items-center gap-3 px-3 py-2 rounded-xl transition-all group
                    ${isTop3
                      ? "bg-card border border-border hover:border-accent/40"
                      : "bg-secondary/40 hover:bg-secondary border border-transparent hover:border-border/50"
                    }`}
                  >
                    {/* Rank */}
                    <div className={`w-7 h-7 shrink-0 rounded-lg flex items-center justify-center text-xs font-extrabold shadow-md z-10
                      ${isTop3
                        ? `bg-gradient-to-br ${RANK_STYLES[anime.rank - 1]}`
                        : "bg-muted text-muted-foreground text-[11px]"
                      }`}
                    >
                      {anime.rank}
                    </div>

                    {/* Poster — with lazy + error fallback */}
                    <div className="w-10 h-14 shrink-0 rounded-lg overflow-hidden bg-secondary ring-1 ring-border/50 z-10">
                      {anime.poster ? (
                        <img
                          src={anime.poster}
                          alt={anime.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          decoding="async"
                          onError={(e) => { e.currentTarget.style.display = "none"; }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Flame className="w-4 h-4 text-muted-foreground/20" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0 z-10">
                      <p className="text-sm font-semibold truncate group-hover:text-primary transition-colors leading-tight">
                        {anime.title}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                        {anime.type && (
                          <span className="text-[10px] text-muted-foreground">{anime.type}</span>
                        )}
                        {anime.score && (
                          <>
                            <span className="text-[10px] text-muted-foreground">·</span>
                            <span className="flex items-center gap-0.5 text-[10px] text-yellow-400 font-semibold">
                              <Star className="w-2.5 h-2.5 fill-current" />
                              {anime.score}
                            </span>
                          </>
                        )}
                        {anime.status && (
                          <>
                            <span className="text-[10px] text-muted-foreground">·</span>
                            <span className={`text-[10px] font-semibold ${
                              (anime.status || "").toLowerCase().includes("ongoing") || anime.status === "Currently Airing"
                                ? "text-green-400"
                                : "text-blue-400"
                            }`}>
                              {anime.status}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Rank flame for top 3 */}
                    {isTop3 && (
                      <Flame className={`w-4 h-4 shrink-0 z-10 ${
                        anime.rank === 1 ? "text-yellow-400" : anime.rank === 2 ? "text-slate-400" : "text-amber-600"
                      }`} />
                    )}
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}
    </section>
  );
}
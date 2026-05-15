import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { animeApi } from "@/lib/animeApi";
import { bookmarkStorage } from "@/lib/localStorage";
import { authStorage } from "@/lib/auth";
import { DetailSkeleton } from "@/components/anime/LoadingSkeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Bookmark, BookmarkCheck, Star, Calendar, Film,
  PlayCircle, Info, ArrowLeft, ChevronDown, ChevronUp, Lock, LogIn,
} from "lucide-react";
import AiRecommendation from "@/components/anime/AiRecommendation";
import RelatedSeries from "@/components/anime/RelatedSeries";
import { motion, AnimatePresence } from "framer-motion";
import AuthModal from "@/components/auth/AuthModal";

const DAY_LABELS = {
  senin: "Senin", selasa: "Selasa", rabu: "Rabu", kamis: "Kamis",
  jumat: "Jumat", sabtu: "Sabtu", minggu: "Minggu",
};

function getReleaseDay(day) {
  if (!day) return null;
  const lower = day.toLowerCase();
  for (const [key, val] of Object.entries(DAY_LABELS)) {
    if (lower.includes(key)) return val;
  }
  return day;
}

export default function AnimeDetail() {
  const { animeId: rawAnimeId } = useParams();
  const animeId = decodeURIComponent(rawAnimeId || "");
  const navigate = useNavigate();
  const [synopsisExpanded, setSynopsisExpanded] = useState(false);
  const [bookmarked, setBookmarked] = useState(() => bookmarkStorage.isBookmarked(animeId));
  const [user, setUser] = useState(() => authStorage.getUser());
  const [showAuth, setShowAuth] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["anime", animeId],
    queryFn: () => animeApi.getAnimeDetail(animeId),
  });

  if (isLoading) return <DetailSkeleton />;

  const anime = data?.data;
  if (!anime) {
    return (
      <div className="text-center py-20">
        <Info className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
        <p className="text-muted-foreground">Anime tidak ditemukan</p>
      </div>
    );
  }

  const episodes = anime.episodeList || [];
  const genres = anime.genres || [];
  const rawSynopsis = anime.synopsis;
  const synopsis = typeof rawSynopsis === "string"
    ? rawSynopsis
    : rawSynopsis?.paragraphs?.join(" ") || "";
  const releaseDay = getReleaseDay(anime.releaseDay);

  const toggleBookmark = () => {
    if (!user) { setShowAuth(true); return; }
    if (bookmarked) {
      bookmarkStorage.remove(animeId);
      setBookmarked(false);
    } else {
      bookmarkStorage.add({
        anime_id: animeId,
        title: anime.title,
        poster: anime.poster,
        status: anime.status,
        score: anime.score,
      });
      setBookmarked(true);
    }
  };

  // Score can be "7.50", "7.5/10", or number — normalize to float
  const rawScore = String(anime.score || "").replace(/\/.*$/, "").trim();
  const scoreNum = parseFloat(rawScore);

  return (
    <div className="space-y-8">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Kembali
      </button>

      {/* Hero */}
      <div className="flex flex-col md:flex-row gap-6 md:gap-8">
        {/* Poster */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="shrink-0 mx-auto md:mx-0"
        >
          <div className="w-48 md:w-60 aspect-[3/4] rounded-2xl overflow-hidden bg-secondary ring-1 ring-border shadow-2xl shadow-black/40">
            {anime.poster ? (
              <img src={anime.poster} alt={anime.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <PlayCircle className="w-16 h-16 text-muted-foreground/30" />
              </div>
            )}
          </div>
        </motion.div>

        {/* Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex-1 space-y-4"
        >
          <div>
            <h1 className="text-2xl md:text-3xl font-heading font-extrabold leading-tight tracking-tight">
              {anime.title}
            </h1>
            {anime.japanese && (
              <p className="text-sm text-muted-foreground mt-1">{anime.japanese}</p>
            )}
          </div>

          {/* Badges row */}
          <div className="flex flex-wrap gap-2">
            {scoreNum > 0 && (
              <Badge className="bg-yellow-500/15 text-yellow-400 border-yellow-500/25 gap-1 font-bold">
                <Star className="w-3 h-3 fill-current" />
                {scoreNum % 1 === 0 ? scoreNum.toFixed(0) : scoreNum.toFixed(2)} / 10
              </Badge>
            )}
            {anime.status && (
              <Badge variant="outline" className="gap-1">
                <Film className="w-3 h-3" />
                {anime.status}
              </Badge>
            )}
            {anime.type && <Badge variant="outline">{anime.type}</Badge>}
            {episodes.length > 0 && (
              <Badge variant="outline" className="gap-1">
                <PlayCircle className="w-3 h-3" />
                {episodes.length} Episode
              </Badge>
            )}
            {(anime.aired || anime.releasedOn) && (
              <Badge variant="outline" className="gap-1">
                <Calendar className="w-3 h-3" />
                {anime.aired || anime.releasedOn}
              </Badge>
            )}
            {releaseDay && (
              <Badge className="bg-primary/10 text-primary border-primary/20">
                Tayang: {releaseDay}
              </Badge>
            )}
          </div>

          {/* Genres */}
          {genres.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {genres.map((g, i) => (
                <Link key={i} to={`/genre/${encodeURIComponent(
                  typeof g === "string" ? g.toLowerCase().replace(/\s+/g, "-") : ""
                )}`}>
                  <Badge className="bg-secondary text-secondary-foreground hover:bg-primary/15 hover:text-primary border-border text-xs cursor-pointer transition-colors">
                    {typeof g === "string" ? g : (g.name || g.title || "")}
                  </Badge>
                </Link>
              ))}
            </div>
          )}

          {/* Studios */}
          {anime.studios?.length > 0 && (
            <p className="text-xs text-muted-foreground">
              Studio: <span className="text-foreground font-medium">{anime.studios.join(", ")}</span>
            </p>
          )}

          {/* Synopsis */}
          {synopsis && (
            <div className="bg-secondary/60 rounded-xl p-4">
              <h3 className="text-sm font-bold mb-2 text-foreground">Sinopsis</h3>
              <p className={`text-sm text-muted-foreground leading-relaxed ${synopsisExpanded ? "" : "line-clamp-4"}`}>
                {synopsis}
              </p>
              {synopsis.length > 200 && (
                <button
                  onClick={() => setSynopsisExpanded((v) => !v)}
                  className="mt-2 text-xs text-primary flex items-center gap-1 font-medium hover:underline"
                >
                  {synopsisExpanded ? (
                    <><ChevronUp className="w-3 h-3" />Sembunyikan</>
                  ) : (
                    <><ChevronDown className="w-3 h-3" />Baca Selengkapnya</>
                  )}
                </button>
              )}
            </div>
          )}

          {/* Bookmark */}
          <Button
            onClick={toggleBookmark}
            variant={bookmarked ? "default" : "outline"}
            className={`gap-2 font-semibold ${bookmarked ? "bg-primary hover:bg-primary/90" : ""}`}
          >
            {bookmarked ? (
              <><BookmarkCheck className="w-4 h-4" />Tersimpan</>
            ) : (
              <><Bookmark className="w-4 h-4" />Simpan ke Bookmark</>
            )}
          </Button>
        </motion.div>
      </div>

      {/* Episode List */}
      {episodes.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-xl font-heading font-bold mb-4 flex items-center gap-2">
            <PlayCircle className="w-5 h-5 text-primary" />
            Daftar Episode
            <span className="text-sm font-normal text-muted-foreground">({episodes.length} episode)</span>
          </h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-2">
            {episodes.map((ep, i) => {
              const epNum = (() => {
                const m = (String(ep.title || ep.episodeId || "")).match(/(\d+)/g);
                return m ? m[m.length - 1] : String(i + 1);
              })();
              // Episode 1 & 2 bebas, ep 3+ kunci kalau belum login
              const isLocked = i > 1 && !user;
              return isLocked ? (
                <button
                  key={ep.episodeId || i}
                  onClick={() => setShowAuth(true)}
                  className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-border bg-secondary/50 hover:bg-yellow-500/10 hover:border-yellow-500/30 transition-all text-sm font-semibold cursor-pointer group gap-1"
                  title="Login untuk menonton"
                >
                  <Lock className="w-3 h-3 text-muted-foreground/60 group-hover:text-yellow-400 transition-colors" />
                  <span className="text-muted-foreground/60 group-hover:text-yellow-400 transition-colors">{epNum}</span>
                </button>
              ) : (
                <Link
                  key={ep.episodeId || i}
                  to={`/episode/${encodeURIComponent(ep.episodeId)}`}
                  state={{ animeId, animeTitle: anime.title, poster: anime.poster, episodes }}
                >
                  <div className="flex items-center justify-center p-2.5 rounded-xl border border-border bg-secondary/50 hover:bg-primary/15 hover:border-primary/40 hover:text-primary transition-all text-sm font-semibold cursor-pointer">
                    <span>{epNum}</span>
                  </div>
                </Link>
              );
            })}
          </div>
          {!user && episodes.length > 2 && (
            <div className="mt-3 flex items-center gap-2 px-3 py-2.5 bg-yellow-500/10 border border-yellow-500/25 rounded-xl">
              <Lock className="w-4 h-4 text-yellow-400 shrink-0" />
              <p className="text-[11px] text-yellow-300 flex-1">Episode 3 dan seterusnya dikunci. <button onClick={() => setShowAuth(true)} className="font-bold underline hover:text-yellow-200 min-h-[44px] inline-flex items-center">Login gratis</button> untuk unlock semua episode.</p>
            </div>
          )}
        </motion.section>
      )}

      {/* Related Series & Seasons */}
      <RelatedSeries
        animeId={animeId}
        recommendedAnimeList={anime.recommendedAnimeList || []}
      />

      {/* AI Recommendation */}
      <AiRecommendation
        currentAnimeTitle={anime.title}
        genres={genres.map((g) => (typeof g === "string" ? g : g.name || g.title || ""))}
      />

      {/* Auth Modal */}
      <AnimatePresence>
        {showAuth && (
          <AuthModal
            onClose={() => setShowAuth(false)}
            onSuccess={(u) => { setUser(u); setShowAuth(false); window.dispatchEvent(new Event("renime-auth-change")); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
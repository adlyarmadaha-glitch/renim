import React, { useState } from "react";
import { watchPartyService } from "@/lib/watchParty";
import { nobarRankStorage } from "@/components/watchparty/NobarOtakuRank";
import { animeApi } from "@/lib/animeApi";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { X, Popcorn, Search, ChevronRight, Users, Copy, Check, Globe, Lock, ArrowLeft, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Step 1: Search anime
// Step 2: Pick episode
// Step 3: Room created

function AnimeSearchStep({ onSelect }) {
  const [q, setQ] = useState("");
  const [submitted, setSubmitted] = useState("");

  const { data, isFetching } = useQuery({
    queryKey: ["wp-search", submitted],
    queryFn: () => animeApi.search(submitted),
    enabled: submitted.length > 1,
    staleTime: 1000 * 60 * 5,
  });

  const results = data?.data?.animeList || [];

  return (
    <div className="space-y-4">
      <div className="text-center space-y-1">
        <p className="font-bold text-base">Pilih Anime</p>
        <p className="text-xs text-muted-foreground">Cari anime yang mau ditonton bareng</p>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); setSubmitted(q.trim()); }} className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Cari anime..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="pl-9 bg-secondary border-secondary"
        />
      </form>

      {isFetching && (
        <div className="flex justify-center py-4">
          <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      )}

      <div className="space-y-1.5 max-h-64 overflow-y-auto">
        {results.map((anime) => (
          <button key={anime.animeId} onClick={() => onSelect(anime)}
            className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-secondary transition-colors text-left group">
            <div className="w-10 h-14 rounded-lg overflow-hidden bg-secondary shrink-0">
              {anime.poster && <img src={anime.poster} alt={anime.title} className="w-full h-full object-cover" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{anime.title}</p>
              <p className="text-xs text-muted-foreground">{anime.status || ""}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary shrink-0" />
          </button>
        ))}
        {submitted && !isFetching && results.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-4">Tidak ada hasil</p>
        )}
      </div>
    </div>
  );
}

function EpisodePickStep({ anime, onSelect, onBack }) {
  const { data, isLoading } = useQuery({
    queryKey: ["wp-detail", anime.animeId],
    queryFn: () => animeApi.getAnimeDetail(anime.animeId),
    staleTime: 1000 * 60 * 5,
  });

  const episodes = data?.data?.episodeList || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm truncate">{anime.title}</p>
          <p className="text-xs text-muted-foreground">Pilih episode</p>
        </div>
        {anime.poster && <img src={anime.poster} alt={anime.title} className="w-8 h-11 rounded-lg object-cover shrink-0" />}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-4">
          <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-1 max-h-64 overflow-y-auto">
          {episodes.slice().reverse().map((ep) => (
            <button key={ep.episodeId} onClick={() => onSelect(ep)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-secondary transition-colors text-left group">
              <Play className="w-3.5 h-3.5 text-primary shrink-0" />
              <span className="text-sm flex-1 truncate">{ep.title || `Episode ${ep.episodeId}`}</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary shrink-0" />
            </button>
          ))}
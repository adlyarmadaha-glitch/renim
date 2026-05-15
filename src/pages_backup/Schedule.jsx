import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { animeApi } from "@/lib/animeApi";
import { reminderStorage } from "@/lib/localStorage";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar, PlayCircle, Clock, ChevronLeft, ChevronRight,
  Star, Sparkles, Tv, Film, Bell, BellRing
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const DAYS_ORDER = ["senin","selasa","rabu","kamis","jumat","sabtu","minggu"];

const DAY_META = {
  senin:  { color: "bg-blue-500/10 text-blue-400 border-blue-500/25",  dot: "bg-blue-400",    label: "Senin" },
  selasa: { color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/25", dot: "bg-emerald-400", label: "Selasa" },
  rabu:   { color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/25", dot: "bg-yellow-400", label: "Rabu" },
  kamis:  { color: "bg-orange-500/10 text-orange-400 border-orange-500/25", dot: "bg-orange-400", label: "Kamis" },
  jumat:  { color: "bg-pink-500/10 text-pink-400 border-pink-500/25",  dot: "bg-pink-400",    label: "Jumat" },
  sabtu:  { color: "bg-purple-500/10 text-purple-400 border-purple-500/25", dot: "bg-purple-400", label: "Sabtu" },
  minggu: { color: "bg-red-500/10 text-red-400 border-red-500/25", dot: "bg-red-400", label: "Minggu" },
};

function getDayMeta(day) {
  if (!day) return { color: "bg-secondary text-muted-foreground border-border", dot: "bg-muted-foreground", label: day };
  const lower = day.toLowerCase();
  for (const [key, meta] of Object.entries(DAY_META)) {
    if (lower.includes(key)) return meta;
  }
  return { color: "bg-secondary text-muted-foreground border-border", dot: "bg-muted-foreground", label: day };
}

function getTodayDay() {
  const days = ["minggu","senin","selasa","rabu","kamis","jumat","sabtu"];
  return days[new Date().getDay()];
}

function ScheduleSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {Array(7).fill(0).map((_, i) => <Skeleton key={i} className="h-14 w-20 rounded-2xl shrink-0" />)}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {Array(8).fill(0).map((_, j) => <Skeleton key={j} className="h-20 rounded-2xl" />)}
      </div>
    </div>
  );
}

function UpcomingSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {Array(12).fill(0).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="aspect-[3/4] w-full rounded-2xl" />
          <Skeleton className="h-3 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      ))}
    </div>
  );
}

// ── Reminder Button ───────────────────────────────────────────
function ReminderButton({ anime, className = "" }) {
  const [reminded, setReminded] = useState(() => reminderStorage.isReminded(anime.animeId));

  const toggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (reminded) {
      reminderStorage.remove(anime.animeId);
      setReminded(false);
    } else {
      reminderStorage.add({ animeId: anime.animeId, title: anime.title, poster: anime.poster });
      setReminded(true);
    }
  };

  return (
    <button
      onClick={toggle}
      title={reminded ? "Hapus pengingat" : "Ingatkan saya"}
      className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold transition-all border shrink-0 ${
        reminded
          ? "bg-primary/15 border-primary/40 text-primary"
          : "bg-secondary border-border text-muted-foreground hover:text-primary hover:border-primary/30"
      } ${className}`}
    >
      {reminded ? <BellRing className="w-3 h-3" /> : <Bell className="w-3 h-3" />}
      {reminded ? "Diingatkan" : "Ingatkan"}
    </button>
  );
}

// ── Weekly Schedule ───────────────────────────────────────────
function WeeklySchedule() {
  const today = getTodayDay();
  const [activeDay, setActiveDay] = useState(today);

  const { data, isLoading, error } = useQuery({
    queryKey: ["schedule-v3"],
    queryFn: () => animeApi.getSchedule(),
    staleTime: 1000 * 60 * 10,
    retry: 2,
  });

  if (isLoading) return <ScheduleSkeleton />;

  if (error || !data?.data?.length) {
    // Tampilkan fallback dengan info
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-yellow-500/10 border border-yellow-500/20">
          <Calendar className="w-4 h-4 text-yellow-400 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-yellow-400">Jadwal Sedang Dimuat Ulang</p>
            <p className="text-xs text-muted-foreground">Sedang mengambil data terbaru dari server, coba refresh halaman.</p>
          </div>
        </div>
      </div>
    );
  }

  const rawDays = data.data;
  const days = [...rawDays].sort((a, b) => {
    const ai = DAYS_ORDER.findIndex((d) => (a.day || "").toLowerCase().includes(d));
    const bi = DAYS_ORDER.findIndex((d) => (b.day || "").toLowerCase().includes(d));
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });

  const dayPills = days.map((d) => {
    const dayLower = (d.day || "").toLowerCase();
    const meta = getDayMeta(d.day);
    const isT = dayLower.includes(today);
    const isActive = dayLower.includes(activeDay);
    return { ...d, meta, isToday: isT, isActive, dayLower };
  });

  const activeData = days.find((d) => (d.day || "").toLowerCase().includes(activeDay)) || days[0];
  const animeList = activeData?.animeList || [];
  const activeMeta = getDayMeta(activeData?.day);
  const isToday = (activeData?.day || "").toLowerCase().includes(today);

  return (
    <div className="space-y-5">
      {/* Reminder hint */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Bell className="w-3.5 h-3.5 shrink-0" />
        <span>Tekan 🔔 pada anime untuk diingatkan · Kelola di <Link to="/settings" className="text-primary hover:underline">Pengaturan</Link></span>
      </div>

      {/* Day selector */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {dayPills.map((d, i) => (
          <button
            key={i}
            onClick={() => setActiveDay(d.dayLower.split(" ")[0])}
            className={`flex flex-col items-center gap-1 px-4 py-2.5 rounded-2xl text-xs font-bold border whitespace-nowrap transition-all shrink-0 ${
              d.isActive
                ? `${d.meta.color} shadow-md scale-[1.04]`
                : "border-border text-muted-foreground hover:border-primary/30 hover:text-foreground"
            }`}
          >
            <span>{d.meta.label || d.day}</span>
            <div className="flex items-center gap-1">
              {d.isToday && <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />}
              <span className={`text-[10px] font-normal ${d.isActive ? "opacity-80" : "opacity-50"}`}>{(d.animeList || []).length} anime</span>
            </div>
          </button>
        ))}
      </div>

      {/* Active day header */}
      <div className="flex items-center gap-2.5">
        <div className={`w-3 h-3 rounded-full ${activeMeta.dot}`} />
        <h2 className="text-lg font-bold">{activeData?.day}</h2>
        {isToday && (
          <Badge className="bg-primary text-white text-[10px] font-bold px-2 py-0.5 animate-pulse">
            Hari Ini
          </Badge>
        )}
        <span className="text-sm text-muted-foreground ml-auto">{animeList.length} anime tayang</span>
      </div>

      {/* Anime grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeDay}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.15 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3"
        >
          {animeList.map((anime, i) => (
            <div key={anime.animeId || i} className={`flex items-center gap-3 p-3 rounded-2xl border bg-card hover:border-primary/40 hover:bg-primary/5 transition-all group ${
              isToday ? "border-primary/15" : "border-border"
            }`}>
              <Link to={`/anime/${encodeURIComponent(anime.animeId)}`} className="flex items-center gap-3 flex-1 min-w-0">
                {anime.poster ? (
                  <img
                    src={anime.poster}
                    alt={anime.title}
                    className="w-10 h-14 rounded-xl object-cover shrink-0 ring-1 ring-border group-hover:ring-primary/40 transition-all"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-10 h-14 rounded-xl bg-secondary shrink-0 flex items-center justify-center">
                    <PlayCircle className="w-4 h-4 text-muted-foreground/40" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <h3 className="text-xs font-semibold line-clamp-2 group-hover:text-primary transition-colors leading-snug">
                    {anime.title}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                    {anime.releaseTime && (
                      <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                        <Clock className="w-2.5 h-2.5" />{anime.releaseTime}
                      </span>
                    )}
                    {anime.episode && (
                      <span className="text-[10px] text-primary/80 font-medium">{anime.episode}</span>
                    )}
                  </div>
                </div>
              </Link>
              <ReminderButton anime={anime} />
            </div>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ── Upcoming / Seasonal Anime ─────────────────────────────────
function UpcomingAnime() {
  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["upcoming", page],
    queryFn: () => animeApi.getUpcoming(page),
    placeholderData: (prev) => prev,
  });

  const list = data?.data?.animeList || [];
  const hasPrev = page > 1;
  const hasNext = data?.pagination?.hasNextPage ?? list.length >= 20;

  const goTo = (p) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-gradient-to-r from-accent/10 to-primary/10 border border-accent/20">
        <Sparkles className="w-4 h-4 text-accent shrink-0" />
        <div>
          <p className="text-sm font-semibold text-foreground">Anime Season Ini</p>
          <p className="text-xs text-muted-foreground">Semua anime yang sedang tayang musim ini · Halaman {page}</p>
        </div>
      </div>

      {isLoading ? (
        <UpcomingSkeleton />
      ) : list.length === 0 ? (
        <div className="text-center py-16">
          <Sparkles className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
          <p className="text-muted-foreground">Tidak ada data</p>
        </div>
      ) : (
        <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 ${isFetching ? "opacity-60" : ""} transition-opacity`}>
          {list.map((anime, i) => (
            <motion.div
              key={anime.animeId || i}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.015 }}
            >
              <Link to={`/anime/${encodeURIComponent(anime.animeId)}`}>
                <div className="group cursor-pointer">
                  <div className="relative aspect-[3/4] overflow-hidden rounded-2xl mb-2 bg-secondary ring-1 ring-border group-hover:ring-primary/50 group-hover:shadow-lg group-hover:shadow-primary/10 transition-all duration-300">
                    {anime.poster ? (
                      <img
                        src={anime.poster}
                        alt={anime.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-400"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <PlayCircle className="w-8 h-8 text-muted-foreground/20" />
                      </div>
                    )}
                    {anime.score && anime.score !== "0" && anime.score !== "?" && (
                      <div className="absolute top-2 left-2 flex items-center gap-0.5 px-1.5 py-0.5 rounded-lg bg-black/75 backdrop-blur-sm text-yellow-400 text-[10px] font-bold">
                        <Star className="w-2.5 h-2.5 fill-current" />{anime.score}
                      </div>
                    )}
                    {anime.type && (
                      <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded-lg bg-primary/85 backdrop-blur-sm text-white text-[10px] font-bold flex items-center gap-0.5">
                        {anime.type === "Movie" ? <Film className="w-2.5 h-2.5" /> : <Tv className="w-2.5 h-2.5" />}
                        {anime.type}
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 px-2.5 py-2 bg-gradient-to-t from-black/95 via-black/50 to-transparent">
                      <span className="text-[10px] font-bold text-accent uppercase tracking-wide">
                        {anime.status === "Ongoing" || anime.status === "ONGOING" ? "Sedang Tayang" : anime.status || "Seasonal"}
                      </span>
                    </div>
                  </div>
                  <h3 className="text-xs font-semibold line-clamp-2 group-hover:text-primary transition-colors leading-snug">
                    {anime.title}
                  </h3>
                  {anime.genres?.length > 0 && (
                    <p className="text-[10px] text-muted-foreground/60 mt-0.5 line-clamp-1">
                      {anime.genres.slice(0, 3).join(" · ")}
                    </p>
                  )}
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {(hasPrev || hasNext) && !isLoading && (
        <div className="flex items-center justify-center gap-3 pt-2">
          <Button variant="outline" size="sm" onClick={() => goTo(page - 1)} disabled={!hasPrev || isFetching} className="gap-1.5">
            <ChevronLeft className="w-4 h-4" /> Sebelumnya
          </Button>
          <span className="text-xs text-muted-foreground px-2">Hal {page}</span>
          <Button variant="outline" size="sm" onClick={() => goTo(page + 1)} disabled={!hasNext || isFetching} className="gap-1.5">
            Berikutnya <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────
export default function Schedule() {
  const [activeTab, setActiveTab] = useState("weekly");

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
        <h1 className="text-xl sm:text-2xl font-heading font-bold">Jadwal Anime</h1>
      </div>

      <div className="flex gap-2 mb-6 bg-secondary/50 p-1 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab("weekly")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            activeTab === "weekly" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Jadwal Mingguan</span>
          <span className="sm:hidden">Mingguan</span>
        </button>
        <button
          onClick={() => setActiveTab("upcoming")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            activeTab === "upcoming" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Seasonal</span>
          <span className="sm:hidden">Seasonal</span>
        </button>
      </div>

      {activeTab === "weekly" ? <WeeklySchedule /> : <UpcomingAnime />}
    </div>
  );
}
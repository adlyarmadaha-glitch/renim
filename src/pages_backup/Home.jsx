import React, { useState, useEffect, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { animeApi } from "@/lib/animeApi";
import AnimeGrid from "@/components/anime/AnimeGrid";
import { AnimeGridSkeleton } from "@/components/anime/LoadingSkeleton";
import HeroBanner from "@/components/anime/HeroBanner";
import TopAnimeCarousel from "@/components/anime/TopAnimeCarousel";
import GenreBar from "@/components/anime/GenreBar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import TopList from "@/components/anime/TopList";
import ContinueWatching from "@/components/anime/ContinueWatching";
import Leaderboard from "@/components/home/Leaderboard";
import { bookmarkStorage, reminderStorage } from "@/lib/localStorage";
import { checkBookmarkUpdates } from "@/lib/bookmarkNotifications";
import { Button } from "@/components/ui/button";
import { ChevronDown, Popcorn } from "lucide-react";
import DonghuaHomeSection from "@/components/donghua/DonghuaHomeSection";
import { Link } from "react-router-dom";
import PullToRefresh from "@/components/ui/PullToRefresh";
import ReleasedAnimeBanner from "@/components/schedule/ReleasedAnimeBanner";

const PAGE_SIZE = 24;

export default function Home() {
  const queryClient = useQueryClient();
  const [ongoingPage, setOngoingPage] = useState(1);
  const [completedPage, setCompletedPage] = useState(1);
  const [ongoingList, setOngoingList] = useState([]);
  const [completedList, setCompletedList] = useState([]);

  const handleRefresh = useCallback(async () => {
    setOngoingPage(1);
    setCompletedPage(1);
    setOngoingList([]);
    setCompletedList([]);
    await queryClient.invalidateQueries({ queryKey: ["home-v3"] });
  }, [queryClient]);

  const { data, isLoading } = useQuery({
    queryKey: ["home-v3"],
    queryFn: () => animeApi.getHome(),
    staleTime: 1000 * 60 * 3,
  });

  // Load more pages for ongoing
  const { data: ongoingMore, isFetching: loadingMoreOngoing } = useQuery({
    queryKey: ["ongoing-page", ongoingPage],
    queryFn: () => animeApi.getOngoing(ongoingPage),
    enabled: ongoingPage > 1,
    staleTime: 1000 * 60 * 5,
  });

  // Load more pages for completed
  const { data: completedMore, isFetching: loadingMoreCompleted } = useQuery({
    queryKey: ["completed-page", completedPage],
    queryFn: () => animeApi.getCompleted(completedPage),
    enabled: completedPage > 1,
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    const bookmarks = bookmarkStorage.list ? bookmarkStorage.list() : [];
    if (bookmarks.length > 0) {
      checkBookmarkUpdates(bookmarks, (id) => animeApi.getAnimeDetail(id));
    }
  }, []);

  // Cek reminder vs jadwal — kalau anime ada di jadwal hari ini, tandai sebagai rilis
  useEffect(() => {
    const checkReminders = async () => {
      const reminders = reminderStorage.list();
      if (reminders.length === 0) return;
      const scheduleData = await animeApi.getSchedule();
      const allAnime = (scheduleData?.data || []).flatMap((d) => d.animeList || []);
      reminders.forEach((r) => {
        const found = allAnime.find((a) => a.animeId === r.animeId);
        if (found) {
          reminderStorage.markReleased(r.animeId, found.episode ? `Episode ${found.episode}` : "Episode baru sudah rilis!");
        }
      });
    };
    checkReminders();
  }, []);

  // Initialize lists from home data (reset when home data loads)
  useEffect(() => {
    if (data?.data) {
      setOngoingList(data.data.ongoing || []);
      setCompletedList(data.data.completed || []);
      // Reset extra pages when home data reloads to avoid duplicates
      setOngoingPage(1);
      setCompletedPage(1);
    }
  }, [data]);

  // Append more ongoing (only when page > 1)
  useEffect(() => {
    if (ongoingPage <= 1 || !ongoingMore?.data?.animeList?.length) return;
    setOngoingList((prev) => {
      const ids = new Set(prev.map((a) => a.animeId).filter(Boolean));
      const newItems = ongoingMore.data.animeList.filter((a) => a.animeId && !ids.has(a.animeId));
      return [...prev, ...newItems];
    });
  }, [ongoingMore]);

  // Append more completed (only when page > 1)
  useEffect(() => {
    if (completedPage <= 1 || !completedMore?.data?.animeList?.length) return;
    setCompletedList((prev) => {
      const ids = new Set(prev.map((a) => a.animeId).filter(Boolean));
      const newItems = completedMore.data.animeList.filter((a) => a.animeId && !ids.has(a.animeId));
      return [...prev, ...newItems];
    });
  }, [completedMore]);

  return (
    <PullToRefresh onRefresh={handleRefresh}>
    <div className="space-y-8">
      <ReleasedAnimeBanner />
      <HeroBanner />
      {/* Nobar Banner */}
      <Link to="/nobar" className="block">
        <div className="rounded-2xl bg-gradient-to-r from-primary/15 via-primary/8 to-accent/10 border border-primary/20 p-4 flex items-center gap-4 hover:border-primary/40 transition-all group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0 shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
            <Popcorn className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm">🍿 Nonton Bareng — Nobar Room Publik</p>
            <p className="text-xs text-muted-foreground">Tonton anime bareng teman secara realtime • Buat atau gabung room</p>
          </div>
          <ChevronDown className="-rotate-90 w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
        </div>
      </Link>
      <ContinueWatching />
      <TopAnimeCarousel animeList={ongoingList.slice(0, 20)} isLoading={isLoading} title="Update Terbaru" />
      <GenreBar />
      <TopList />
      <DonghuaHomeSection />
      <Leaderboard />

      <Tabs defaultValue="ongoing" className="space-y-5">
        <TabsList className="bg-secondary h-10">
          <TabsTrigger value="ongoing" className="text-sm">🔴 Sedang Tayang</TabsTrigger>
          <TabsTrigger value="completed" className="text-sm">✅ Selesai</TabsTrigger>
        </TabsList>

        <TabsContent value="ongoing">
          {isLoading ? (
            <AnimeGridSkeleton />
          ) : (
            <div className="space-y-6">
              <AnimeGrid animeList={ongoingList} title="Anime Ongoing" subtitle={`${ongoingList.length} anime sedang tayang`} />
              <div className="flex justify-center">
                <Button
                  variant="outline"
                  onClick={() => setOngoingPage((p) => p + 1)}
                  disabled={loadingMoreOngoing}
                  className="gap-2 border-border hover:bg-primary/10 hover:border-primary/40 hover:text-primary"
                >
                  {loadingMoreOngoing ? (
                    <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                  Muat Lebih Banyak
                </Button>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed">
          {isLoading ? (
            <AnimeGridSkeleton />
          ) : (
            <div className="space-y-6">
              <AnimeGrid animeList={completedList} title="Anime Selesai" subtitle={`${completedList.length} anime sudah tamat`} />
              <div className="flex justify-center">
                <Button
                  variant="outline"
                  onClick={() => setCompletedPage((p) => p + 1)}
                  disabled={loadingMoreCompleted}
                  className="gap-2 border-border hover:bg-primary/10 hover:border-primary/40 hover:text-primary"
                >
                  {loadingMoreCompleted ? (
                    <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                  Muat Lebih Banyak
                </Button>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
    </PullToRefresh>
  );
}
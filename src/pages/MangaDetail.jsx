import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { mangaApi } from "@/lib/mangaApi";
import { authStorage } from "@/lib/auth";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Star, ChevronDown, ChevronUp, ArrowLeft, BookMarked, Lock, LogIn } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import AuthModal from "@/components/auth/AuthModal";

export default function MangaDetail() {
  const { slug } = useParams();
  const [showAllChapters, setShowAllChapters] = useState(false);
  const [user, setUser] = useState(() => authStorage.getUser());
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    const handler = () => setUser(authStorage.getUser());
    window.addEventListener("renime-auth-change", handler);
    return () => window.removeEventListener("renime-auth-change", handler);
  }, []);

  const { data: manga, isLoading } = useQuery({
    queryKey: ["manga-detail", slug],
    queryFn: () => mangaApi.getDetail(slug),
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex gap-5">
          <Skeleton className="w-36 sm:w-48 aspect-[3/4] rounded-xl shrink-0" />
          <div className="flex-1 space-y-3 pt-1">
            <Skeleton className="h-7 w-3/4" />
            <Skeleton className="h-5 w-1/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
        <div className="space-y-2">
          {Array(8).fill(0).map((_, i) => <Skeleton key={i} className="h-12 rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (!manga) return (
    <div className="text-center py-20 text-muted-foreground">Manga tidak ditemukan</div>
  );

  const chapters = manga.chapterList || [];
  // API returns newest-first; firstChapter = oldest (chapter 1), lastChapter = newest
  const firstChapter = chapters[chapters.length - 1];
  const lastChapter = chapters[0];

  // Display: reversed so chapter 1 is at top, latest at bottom
  const reversedChapters = [...chapters].reverse();
  const displayedChapters = showAllChapters ? reversedChapters : reversedChapters.slice(0, 30);

  return (
    <div className="space-y-6">
      {/* Back */}
      <Link to="/manga" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Kembali ke Manga
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-5">
        <div className="w-36 sm:w-48 shrink-0">
          <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-secondary border border-border">
            {manga.poster ? (
              <img src={manga.poster} alt={manga.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <BookOpen className="w-12 h-12 text-muted-foreground/30" />
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 space-y-3">
          <h1 className="text-xl sm:text-2xl font-heading font-extrabold leading-tight">{manga.title}</h1>

          <div className="flex flex-wrap gap-2 items-center">
            <Badge className="bg-primary/10 text-primary border-primary/20 border font-semibold">{manga.type || "Manga"}</Badge>
            {manga.status && (
              <Badge className={`border font-semibold ${manga.status.toLowerCase().includes("ongoing") ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-blue-500/10 text-blue-500 border-blue-500/20"}`}>
                {manga.status}
              </Badge>
            )}
            {manga.score && (
              <div className="flex items-center gap-1 text-yellow-400 text-sm font-bold">
                <Star className="w-3.5 h-3.5 fill-current" />
                {manga.score}
              </div>
            )}
          </div>

          {manga.author && (
            <p className="text-sm text-muted-foreground">Pengarang: <span className="text-foreground font-medium">{manga.author}</span></p>
          )}

          {manga.genres?.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
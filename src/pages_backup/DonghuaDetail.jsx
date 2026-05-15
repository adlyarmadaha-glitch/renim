import React, { useState } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { donghuaApi } from "@/lib/donghuaApi";
import { authStorage } from "@/lib/auth";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft, Star, Tv2, BookmarkPlus, BookmarkCheck,
  PlayCircle, Calendar, Film, Tag, ChevronDown, Lock, ChevronUp
} from "lucide-react";
import CommentSection from "@/components/anime/CommentSection";
import AuthModal from "@/components/auth/AuthModal";
import { AnimatePresence } from "framer-motion";

const BM_KEY = "renime_donghua_bookmarks";
function getBM() { try { return JSON.parse(localStorage.getItem(BM_KEY) || "[]"); } catch { return []; } }
function toggleBM(item) {
  let list = getBM();
  const exists = list.find((b) => b.slug === item.slug);
  if (exists) list = list.filter((b) => b.slug !== item.slug);
  else list.unshift({ ...item, savedAt: new Date().toISOString() });
  localStorage.setItem(BM_KEY, JSON.stringify(list));
  return !exists;
}

// API returns episodes newest-first (index 0 = latest). Reverse for display (ep1 first)
function getEpNum(ep) {
  const m = String(ep.title || ep.slug || "").match(/\d+/g);
  return m ? m[m.length - 1] : "?";
}

export default function DonghuaDetail() {
  const { slug } = useParams();
  const location = useLocation();
  const [bookmarked, setBookmarked] = useState(() => getBM().some((b) => b.slug === slug));
  const [showAll, setShowAll] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [user, setUser] = useState(() => authStorage.getUser());

  const { data: rawDetail, isLoading } = useQuery({
    queryKey: ["donghua-detail-v2", slug],
    queryFn: () => donghuaApi.getDetail(slug),
    staleTime: 1000 * 60 * 10,
  });

  const detail = rawDetail?.data || rawDetail;

  const isOngoing = (detail?.status || "").toLowerCase().includes("ongoing")
    || (detail?.status || "").toLowerCase().includes("airing");

  // Episodes are already sorted ascending in donghuaApi.getDetail (ep1 first)
  const episodeList = detail?.episodeList || [];
  const visibleEps = showAll ? episodeList : episodeList.slice(0, 24);

  if (isLoading) return (
    <div className="space-y-4 max-w-4xl mx-auto">
      <Skeleton className="h-6 w-24" />
      <div className="flex gap-5">
        <Skeleton className="w-40 h-56 rounded-xl shrink-0" />
        <div className="flex-1 space-y-3">
          <Skeleton className="h-7 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-16 w-full" />
        </div>
      </div>
    </div>
  );

  if (!detail) return (
    <div className="text-center py-20 text-muted-foreground">
      <Tv2 className="w-12 h-12 mx-auto mb-3 opacity-20" />
      <p>Donghua tidak ditemukan</p>
      <Button variant="outline" size="sm" className="mt-4" onClick={() => window.history.back()}>
        <ArrowLeft className="w-4 h-4 mr-1" />Kembali
      </Button>
    </div>
  );

  // ep1 = index 0 (after reverse), latest = last index
  const ep1 = episodeList[0];
  const latestEp = episodeList[episodeList.length - 1];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <button onClick={() => window.history.back()}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Kembali
      </button>

      {/* Hero */}
      <div className="flex flex-col sm:flex-row gap-5">
        <div className="shrink-0 w-36 sm:w-44 mx-auto sm:mx-0">
          <div className="rounded-2xl overflow-hidden border border-border shadow-2xl aspect-[3/4] bg-secondary relative">
            {detail.poster ? (
              <img src={detail.poster} alt={detail.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Tv2 className="w-12 h-12 opacity-20" />
              </div>
            )}
            <div className="absolute top-2 left-0 right-0 flex justify-center">
              <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full text-white shadow-md ${
                isOngoing ? "bg-green-500" : "bg-blue-500"
              }`}>
                {isOngoing ? "🔴 ON-AIR" : "✅ TAMAT"}
              </span>
            </div>
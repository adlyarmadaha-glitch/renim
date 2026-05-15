import React, { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { mangaApi, mangaHistoryStorage } from "@/lib/mangaApi";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { AnimatePresence } from "framer-motion";
import {
  ArrowLeft, ChevronLeft, ChevronRight, BookOpen,
  ZoomIn, ZoomOut, List, MessageCircle, X, Lock, LogIn
} from "lucide-react";
import CommentSection from "@/components/anime/CommentSection";
import ExpToast from "@/components/rpg/ExpToast";
import AuthModal from "@/components/auth/AuthModal";
import { rpgStorage, expDoneStorage, EXP_PER_CHAPTER, randomExp } from "@/lib/rpgSystem";
import { authStorage } from "@/lib/auth";

// ── Chapter Selector Panel ─────────────────────────────────────────────────
function ChapterPanel({ chapters, currentSlug, mangaSlug, mangaTitle, mangaPoster, onClose, onAuthRequest, user }) {
  const reversed = [...chapters].reverse();
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-card border border-border rounded-t-2xl sm:rounded-2xl w-full max-w-md max-h-[70vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
          <h3 className="font-bold text-sm">Pilih Chapter</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 py-2">
          {reversed.map((ch, i) => {
            const isCurrent = ch.slug === currentSlug;
            const isLocked = i > 1 && !user;
            if (isLocked) return (
              <button key={ch.slug || i} onClick={() => { onClose(); onAuthRequest(); }}
                className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-secondary transition-colors opacity-60">
                <span className="text-sm font-medium flex items-center gap-2">
                  <Lock className="w-3 h-3" />{ch.title || `Chapter ${i + 1}`}
                </span>
                {ch.date && <span className="text-xs text-muted-foreground">{ch.date}</span>}
              </button>
            );
            return (
              <Link
                key={ch.slug || i}
                to={`/manga/chapter/${ch.slug}`}
                state={{ mangaSlug, mangaTitle, mangaPoster, chapters }}
                onClick={onClose}
              >
                <div className={`flex items-center justify-between px-4 py-2.5 transition-colors ${
                  isCurrent ? "bg-primary/15 text-primary" : "hover:bg-secondary"
                }`}>
                  <span className={`text-sm font-medium ${isCurrent ? "font-bold" : ""}`}>{ch.title || `Chapter ${i + 1}`}</span>
                  {ch.date && <span className="text-xs text-muted-foreground">{ch.date}</span>}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Main Reader ────────────────────────────────────────────────────────────
export default function MangaReader() {
  const { "*": chapterSlug } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [zoom, setZoom] = useState(100);
  const [showPanel, setShowPanel] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [expResult, setExpResult] = useState(null);
  const expGivenRef = useRef(false);
  const scrollListenerRef = useRef(null);

  const state = location.state || {};
  const { mangaSlug, mangaTitle, mangaPoster, chapters = [] } = state;

  const { data: chapter, isLoading } = useQuery({
    queryKey: ["manga-chapter", chapterSlug],
    queryFn: () => mangaApi.getChapter(chapterSlug),
  });

  // Save to read history
  useEffect(() => {
    if (chapter && chapterSlug) {
      mangaHistoryStorage.add({
        mangaSlug: mangaSlug || chapter.mangaSlug || chapterSlug,
        chapterSlug,
        title: mangaTitle || chapter.mangaTitle || "",
        chapterTitle: chapter.title || chapterSlug,
        poster: mangaPoster || "",
      });
    }
  }, [chapter, chapterSlug]);

  // Give EXP after user scrolls 80% of chapter — only once per chapter ever
  useEffect(() => {
    if (!chapter) return;
    if (scrollListenerRef.current) window.removeEventListener("scroll", scrollListenerRef.current);

    const onScroll = () => {
      if (expGivenRef.current) return;
      const scrolled = window.scrollY + window.innerHeight;
import React, { useState, useEffect, useRef } from "react";

import { useParams, useLocation, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { donghuaApi, donghuaStorage } from "@/lib/donghuaApi";
import { authStorage } from "@/lib/auth";
import { rpgStorage, expDoneStorage, EXP_PER_EPISODE, randomExp } from "@/lib/rpgSystem";
import { orbStorage } from "@/lib/orbSystem";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft, PlayCircle, ChevronLeft, ChevronRight,
  MonitorPlay, Server, RefreshCw, Lock, Zap,
  Heart, Share2, SkipForward, Popcorn
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import CommentSection from "@/components/anime/CommentSection";
import AuthModal from "@/components/auth/AuthModal";
import ExpToast from "@/components/rpg/ExpToast";
import CreateRoomQuickModal from "@/components/watchparty/CreateRoomQuickModal";

export default function DonghuaEpisodeWatch() {
  const { episodeSlug } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const animeSlug = location.state?.animeSlug || "";
  const animeTitle = location.state?.animeTitle || "";
  const poster = location.state?.poster || "";
  // episodes passed from detail page — ascending order (ep1 first)
  const passedEpisodes = location.state?.episodes || [];

  const [selectedUrl, setSelectedUrl] = useState(null);
  const [activeServer, setActiveServer] = useState(null);
  const [loadingServer, setLoadingServer] = useState(false);
  const [user, setUser] = useState(() => authStorage.getUser());
  const [showAuth, setShowAuth] = useState(false);
  const [pendingEpSlug, setPendingEpSlug] = useState(null); // episode to navigate after login
  const [expResult, setExpResult] = useState(null);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [showSkip, setShowSkip] = useState(false);
  const [showNobarModal, setShowNobarModal] = useState(false);
  const expGivenRef = useRef(false);
  const expTimerRef = useRef(null);
  const skipTimerRef = useRef([]);

  useEffect(() => {
    const handler = () => setUser(authStorage.getUser());
    window.addEventListener("renime-auth-change", handler);
    return () => window.removeEventListener("renime-auth-change", handler);
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ["donghua-ep-v2", episodeSlug],
    queryFn: () => donghuaApi.getEpisode(episodeSlug),
    staleTime: 1000 * 60 * 5,
  });

  // Set first server when data loads
  useEffect(() => {
    if (!data?.data) return;
    const ep = data.data;
    donghuaStorage.addHistory({
      episodeId: episodeSlug,
      animeId: animeSlug || ep.animeId || "",
      animeTitle: animeTitle || ep.animeTitle || "",
      episodeTitle: ep.title || "",
      poster: poster || ep.poster || "",
    });
    // Get first server from qualityGroups
    const groups = ep.qualityGroups || {};
    const firstGroup = Object.values(groups)[0] || [];
    const first = firstGroup[0];
    if (first) {
      setActiveServer(first);
      setSelectedUrl(first.serverId || "");
    }
  }, [data]);

  // Reset on episode change
  useEffect(() => {
    setSelectedUrl(null);
    setActiveServer(null);
    setShowSkip(false);
    expGivenRef.current = false;
    if (expTimerRef.current) clearTimeout(expTimerRef.current);
    skipTimerRef.current.forEach(clearTimeout);
    skipTimerRef.current = [];
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [episodeSlug]);

  useEffect(() => {
    const likeKey = `renime_dlike_${episodeSlug}`;
    setLiked(localStorage.getItem(likeKey) === "1");
    setLikeCount(parseInt(localStorage.getItem(`renime_dlike_count_${episodeSlug}`) || "0") + Math.floor(Math.random() * 40 + 5));
  }, [episodeSlug]);

  // Skip intro button
  useEffect(() => {
    skipTimerRef.current.forEach(clearTimeout);
    if (!selectedUrl) return;
    const t1 = setTimeout(() => setShowSkip(true), 15000);
    const t2 = setTimeout(() => setShowSkip(false), 45000);
    skipTimerRef.current = [t1, t2];
    return () => skipTimerRef.current.forEach(clearTimeout);
  }, [selectedUrl]);

  // EXP after 60s
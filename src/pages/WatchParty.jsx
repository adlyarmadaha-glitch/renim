import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { watchPartyService } from "@/lib/watchParty";
import { authStorage } from "@/lib/auth";
import { animeApi } from "@/lib/animeApi";
import { useQuery } from "@tanstack/react-query";
import WatchPartyChat from "@/components/watchparty/WatchPartyChat";
import WatchPartyMembers from "@/components/watchparty/WatchPartyMembers";
import AuthModal from "@/components/auth/AuthModal";
import { nobarRankStorage, getNobarRank } from "@/components/watchparty/NobarOtakuRank";
import { Button } from "@/components/ui/button";
import {
  Crown, LogOut, Users, MessageCircle, Play, Pause,
  Server, Copy, Check, MonitorPlay, Wifi, ChevronLeft, Popcorn,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function WatchParty() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(() => authStorage.getUser());
  const [room, setRoom] = useState(null);
  const [members, setMembers] = useState([]);
  const [activeTab, setActiveTab] = useState("chat");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [joined, setJoined] = useState(false);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [selectedServerUrl, setSelectedServerUrl] = useState(null);
  const [loadingServer, setLoadingServer] = useState(false);
  const [activeServerId, setActiveServerId] = useState(null);
  const isSyncingRef = useRef(false);
  const lastSyncRef = useRef(null);

  // Auth listener
  useEffect(() => {
    const handler = () => setUser(authStorage.getUser());
    window.addEventListener("renime-auth-change", handler);
    return () => window.removeEventListener("renime-auth-change", handler);
  }, []);

  // If not logged in
  useEffect(() => {
    if (!user) setShowAuthModal(true);
  }, [user]);

  // Subscribe to room
  useEffect(() => {
    if (!roomId) return;
    return watchPartyService.subscribeRoom(roomId, (r) => {
      if (!r) { setError("Room tidak ditemukan atau sudah ditutup"); return; }
      setRoom(r);

      // Sync playback for non-host
      if (user && r.hostId !== user.id && r.lastSyncAt) {
        const syncKey = r.lastSyncAt?.seconds;
        if (syncKey && syncKey !== lastSyncRef.current) {
          lastSyncRef.current = syncKey;
          setSelectedServerUrl(r.playerUrl || null);
        }
      }
    });
  }, [roomId, user]);

  // Subscribe to members
  useEffect(() => {
    if (!roomId) return;
    return watchPartyService.subscribeMembers(roomId, setMembers);
  }, [roomId]);

  // Set player URL from room if non-host
  useEffect(() => {
    if (!room || !user) return;
    if (room.hostId !== user.id && room.playerUrl && !selectedServerUrl) {
      setSelectedServerUrl(room.playerUrl);
    }
  }, [room?.playerUrl]);

  // Fetch episode data (for host to pick server)
  const { data: episodeData } = useQuery({
    queryKey: ["episode", room?.episodeId],
    queryFn: () => animeApi.getEpisode(room.episodeId),
    enabled: !!room?.episodeId,
  });

  const isHost = user && room && room.hostId === user.id;

  // Join room on load + award nobar EXP
  useEffect(() => {
    if (!user || joined || !roomId) return;
    setJoining(true);
    watchPartyService.joinRoom(roomId, user)
      .then(() => {
        setJoined(true);
        // Award EXP for joining
        nobarRankStorage.add(user.id, { exp: 10, roomJoined: true });
      })
      .catch((err) => setError(err.message))
      .finally(() => setJoining(false));
  }, [user, roomId, joined]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (user && roomId) watchPartyService.leaveRoom(roomId, user.id).catch(() => {});
    };
  }, [user, roomId]);
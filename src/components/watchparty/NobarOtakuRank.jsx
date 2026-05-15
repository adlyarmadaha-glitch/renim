/**
 * Nobar Otaku Rank — Gamifikasi peringkat nonton bareng
 * EXP dihitung dari: jumlah room dibuat, chat terkirim, durasi nonton
 */
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Popcorn, Zap, Star, Users, Trophy } from "lucide-react";

const NOBAR_KEY = "renime_nobar_rank";

export const NOBAR_RANKS = [
  { min: 0,    label: "Pemula",        emoji: "🎬", color: "text-slate-400",  bg: "bg-slate-500/10",  border: "border-slate-500/20" },
  { min: 50,   label: "Penonton",      emoji: "👀", color: "text-blue-400",   bg: "bg-blue-500/10",   border: "border-blue-500/20" },
  { min: 150,  label: "Weeabo",        emoji: "🇯🇵", color: "text-green-400",  bg: "bg-green-500/10",  border: "border-green-500/20" },
  { min: 350,  label: "Otaku",         emoji: "😤", color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
  { min: 700,  label: "Otaku Sejati",  emoji: "🔥", color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20" },
  { min: 1200, label: "Wibu Dewa",     emoji: "⚡", color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20" },
  { min: 2000, label: "Isekai Master", emoji: "👑", color: "text-pink-400",   bg: "bg-pink-500/10",   border: "border-pink-500/20" },
];

export function getNobarRank(exp) {
  for (let i = NOBAR_RANKS.length - 1; i >= 0; i--) {
    if (exp >= NOBAR_RANKS[i].min) return { ...NOBAR_RANKS[i], index: i };
  }
  return { ...NOBAR_RANKS[0], index: 0 };
}

export const nobarRankStorage = {
  get(userId) {
    try {
      const raw = localStorage.getItem(`${NOBAR_KEY}_${userId}`);
      return raw ? JSON.parse(raw) : { exp: 0, roomsCreated: 0, roomsJoined: 0, messagesSent: 0 };
    } catch { return { exp: 0, roomsCreated: 0, roomsJoined: 0, messagesSent: 0 }; }
  },
  add(userId, { exp = 0, roomCreated = false, roomJoined = false, messageSent = false } = {}) {
    const data = this.get(userId);
    data.exp = (data.exp || 0) + exp;
    if (roomCreated) data.roomsCreated = (data.roomsCreated || 0) + 1;
    if (roomJoined) data.roomsJoined = (data.roomsJoined || 0) + 1;
    if (messageSent) data.messagesSent = (data.messagesSent || 0) + 1;
    try {
      localStorage.setItem(`${NOBAR_KEY}_${userId}`, JSON.stringify(data));
      window.dispatchEvent(new CustomEvent("renime-nobar-change", { detail: { userId } }));
    } catch {}
    return data;
  },
};

export default function NobarOtakuRank({ userId, compact = false }) {
  const [data, setData] = useState(() => nobarRankStorage.get(userId));

  useEffect(() => {
    const handler = (e) => { if (e.detail?.userId === userId) setData(nobarRankStorage.get(userId)); };
    window.addEventListener("renime-nobar-change", handler);
    return () => window.removeEventListener("renime-nobar-change", handler);
  }, [userId]);

  const rank = getNobarRank(data.exp || 0);
  const nextRank = NOBAR_RANKS[rank.index + 1];
  const progress = nextRank
    ? Math.min(100, Math.round(((data.exp - rank.min) / (nextRank.min - rank.min)) * 100))
    : 100;

  if (compact) {
    return (
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${rank.bg} ${rank.border} ${rank.color}`}>
        <span>{rank.emoji}</span> {rank.label}
      </div>
    );
  }

  return (
    <div className={`rounded-2xl border ${rank.border} ${rank.bg} p-4 space-y-3`}>
      <div className="flex items-center gap-3">
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-3xl"
        >{rank.emoji}</motion.div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className={`font-extrabold text-sm ${rank.color}`}>{rank.label}</p>
            {nextRank && <p className="text-[10px] text-muted-foreground">→ {nextRank.emoji} {nextRank.label}</p>}
          </div>
          <p className="text-xs text-muted-foreground">{data.exp || 0} Nobar EXP</p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-[10px] text-muted-foreground">Rank</p>
          <p className={`text-sm font-extrabold ${rank.color}`}>#{rank.index + 1}</p>
        </div>
      </div>

      {/* Progress bar */}
      {nextRank && (
        <div className="space-y-1">
          <div className="h-1.5 bg-black/20 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className={`h-full rounded-full ${rank.color.replace("text-", "bg-")}`}
            />
          </div>
          <p className="text-[9px] text-muted-foreground text-right">{progress}% menuju {nextRank.label}</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="text-center">
          <Popcorn className={`w-3.5 h-3.5 mx-auto mb-0.5 ${rank.color}`} />
          <p className="text-sm font-bold">{data.roomsCreated || 0}</p>
          <p className="text-[9px] text-muted-foreground">Buat Room</p>
        </div>
        <div className="text-center">
          <Users className={`w-3.5 h-3.5 mx-auto mb-0.5 ${rank.color}`} />
          <p className="text-sm font-bold">{data.roomsJoined || 0}</p>
          <p className="text-[9px] text-muted-foreground">Gabung</p>
        </div>
        <div className="text-center">
          <Zap className={`w-3.5 h-3.5 mx-auto mb-0.5 ${rank.color}`} />
          <p className="text-sm font-bold">{data.messagesSent || 0}</p>
          <p className="text-[9px] text-muted-foreground">Chat</p>
        </div>
      </div>
    </div>
  );
}
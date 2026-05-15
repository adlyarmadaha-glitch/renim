import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Zap, Star, ChevronDown, ChevronUp } from "lucide-react";
import { RAS_CONFIG, levelFromTotalExp } from "@/lib/rpgSystem";
import { getRankByLevel } from "@/lib/rankSystem";
import { getCustomBadge } from "@/pages/AdminPanel";
import { getUserRole } from "@/lib/customRoles";
import CustomBadgeDisplay from "@/components/profile/CustomBadgeDisplay";

function getLeaderboardData() {
  const entries = [];
  const users = JSON.parse(localStorage.getItem("renime_users") || "[]");
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key?.startsWith("renime_rpg_")) continue;
    try {
      const data = JSON.parse(localStorage.getItem(key));
      if (!data?.userId) continue;
      const u = users.find((x) => x.id === data.userId);
      if (!u) continue;
      const totalExp = data.totalExp || 0;
      const { level } = levelFromTotalExp(totalExp);
      const badge = getCustomBadge(u.id);
      const customRole = getUserRole(u.email);
      entries.push({ userId: data.userId, name: u.name || u.email, username: u.username, avatar: u.avatar, email: u.email, ras: data.ras || "manusia", totalExp, level, badge, customRole });
    } catch {}
  }
  return entries.sort((a, b) => b.totalExp - a.totalExp).slice(0, 10);
}

function Avatar({ user, size = "md", ring = "" }) {
  const sizes = { xs: "w-7 h-7 text-[10px]", sm: "w-9 h-9 text-sm", md: "w-11 h-11 text-base", lg: "w-14 h-14 text-lg", xl: "w-16 h-16 text-xl" };
  const cls = sizes[size] || sizes.md;
  const inner = user.avatar
    ? <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
    : <span className="font-extrabold text-white">{(user.name || "A")[0].toUpperCase()}</span>;
  return (
    <div className={`${cls} rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center overflow-hidden shrink-0 ${ring}`}>
      {inner}
    </div>
  );
}

const PODIUM_CFG = [
  { pos: 1, heightCls: "h-12", bg: "bg-yellow-500/15", border: "border-yellow-400/40", text: "text-yellow-400", ring: "ring-2 ring-yellow-400/60", medal: "🥇", scale: "scale-110" },
  { pos: 2, heightCls: "h-8",  bg: "bg-slate-500/15",  border: "border-slate-400/40",  text: "text-slate-300",  ring: "ring-2 ring-slate-400/50",  medal: "🥈", scale: "" },
  { pos: 3, heightCls: "h-6",  bg: "bg-amber-700/15",  border: "border-amber-600/40",  text: "text-amber-500",  ring: "ring-2 ring-amber-500/50",  medal: "🥉", scale: "" },
];

function PodiumCard({ user, cfg, delay }) {
  const rank = getRankByLevel(user.level);
  const rasCfg = RAS_CONFIG[user.ras] || RAS_CONFIG.manusia;
  const isFirst = cfg.pos === 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: "spring", stiffness: 200 }}
      className={`flex flex-col items-center gap-1.5 flex-1 ${isFirst ? "-mt-6 z-10" : "mt-2"}`}
    >
      {isFirst && (
        <motion.div
          animate={{ y: [0, -3, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-2xl"
        >👑</motion.div>
      )}

      <div className={`relative ${cfg.ring} rounded-full ${isFirst ? cfg.scale : ""}`}>
        <Avatar user={user} size={isFirst ? "xl" : "lg"} />
        <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full ${cfg.bg} border ${cfg.border} flex items-center justify-center text-xs`}>
          {cfg.medal}
        </div>
      </div>

      <div className="text-center space-y-0.5 max-w-[90px]">
        <p className="text-xs font-extrabold truncate text-foreground leading-none">{user.name}</p>
        {user.username && <p className="text-[9px] text-muted-foreground truncate">@{user.username}</p>}
        <p className={`text-[9px] font-bold ${rank.color}`}>{rank.name}</p>
        {(user.badge || user.customRole) && (
          <div className="flex flex-wrap justify-center gap-0.5 mt-0.5">
            {user.badge && <CustomBadgeDisplay badge={user.badge} size="xs" />}
            {user.customRole && <CustomBadgeDisplay badge={{ title: user.customRole.label, emoji: user.customRole.emoji, color: user.customRole.color, effect: user.customRole.effect }} size="xs" />}
          </div>
        )}
        <p className="text-[9px] text-muted-foreground">{rasCfg.emoji} {rasCfg.label}</p>
        <div className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-black border ${cfg.border} ${cfg.bg} ${cfg.text}`}>
          <Zap className="w-2 h-2" /> Lv.{user.level}
        </div>
      </div>
    </motion.div>
  );
}

export default function Leaderboard() {
  const [data, setData] = useState([]);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    setData(getLeaderboardData());
    const handler = () => setData(getLeaderboardData());
    window.addEventListener("renime-rpg-change", handler);
    return () => window.removeEventListener("renime-rpg-change", handler);
  }, []);

  if (data.length === 0) return null;
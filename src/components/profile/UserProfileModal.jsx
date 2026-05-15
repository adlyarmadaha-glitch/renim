import React from "react";
import { motion } from "framer-motion";
import { X, Calendar, Zap, Trophy } from "lucide-react";
import { RAS_CONFIG, RARITY_LABEL, rpgStorage, levelFromTotalExp } from "@/lib/rpgSystem";
import RasTitle from "@/components/rpg/RasTitle";
import UserTitle from "@/components/auth/UserTitle";
import RankBadge from "@/components/rpg/RankBadge";
import { getCustomBadge } from "@/pages/AdminPanel";
import CustomBadgeDisplay from "@/components/profile/CustomBadgeDisplay";
import { getRankByLevel } from "@/lib/rankSystem";
import { getUserRole } from "@/lib/customRoles";

export default function UserProfileModal({ user, onClose }) {
  if (!user) return null;

  const rpgData = rpgStorage.get(user.id);
  const ras = rpgData?.ras || "manusia";
  const rasCfg = RAS_CONFIG[ras] || RAS_CONFIG.manusia;
  const totalExp = rpgData?.totalExp || 0;
  const { level, currentExp, nextLevelExp } = levelFromTotalExp(totalExp);
  const pct = Math.min(100, Math.floor((currentExp / nextLevelExp) * 100));
  const rank = getRankByLevel(level);

  const joinDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
    : null;

  const avatar = (() => {
    try {
      const users = JSON.parse(localStorage.getItem("renime_users") || "[]");
      return users.find((u2) => u2.id === user.id)?.avatar || null;
    } catch { return null; }
  })();

  const customBadge = getCustomBadge(user.id);
  const customRole = getUserRole(user.email);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />
      <motion.div
        initial={{ opacity: 0, scale: 0.88, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.88, y: 24 }}
        transition={{ type: "spring", stiffness: 300, damping: 28 }}
        className="relative z-10 w-full max-w-sm overflow-y-auto rounded-3xl shadow-2xl border border-border/60"
        style={{ background: "hsl(var(--card))", maxHeight: "min(90vh, 640px)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Hero header */}
        <div className={`relative h-28 sm:h-32 ${rasCfg.bg} overflow-hidden shrink-0`}>
          {rasCfg.animated && (
            <div className="absolute inset-0" style={{
              background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.12) 50%, transparent 100%)",
              animation: "shimmer 2.5s infinite",
            }} />
          )}
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, hsl(var(--primary)/0.35) 0%, transparent 60%), radial-gradient(circle at 80% 30%, hsl(var(--accent)/0.25) 0%, transparent 55%)`,
          }} />
          <div className="absolute top-3 left-4">
            <span className={`text-xs font-extrabold px-2.5 py-1 rounded-full border ${rank.bg} ${rank.color} ${rank.border} backdrop-blur-sm`}>
              {rank.emoji} {rank.name}
            </span>
          </div>
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/30 hover:bg-black/50 text-white/70 hover:text-white flex items-center justify-center transition-all border border-white/10 backdrop-blur-sm"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-4 sm:px-5 pb-5">
          <div className="flex items-end justify-between -mt-12 mb-3">
            <div className="relative">
              <div className={`absolute -inset-1 rounded-full blur-md opacity-60 ${rasCfg.bg}`} />
              {avatar ? (
                <img src={avatar} alt={user.name}
                  className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover ring-4 ring-card border-2 ${rasCfg.border} shadow-2xl`} />
              ) : (
                <div className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-2xl sm:text-3xl font-bold ring-4 ring-card border-2 ${rasCfg.border} shadow-2xl`}>
                  {(user.name || "A")[0].toUpperCase()}
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-primary text-white text-[9px] font-extrabold shadow-lg border-2 border-card">
                <Zap className="w-2.5 h-2.5" />{level}
              </div>
            </div>

            <div className="pb-1 flex flex-col items-end gap-1 max-w-[160px]">
              <UserTitle role={user.role || "user"} size="xs" />
              <RasTitle ras={ras} size="xs" />
              {customRole && <CustomBadgeDisplay badge={{ title: customRole.label, emoji: customRole.emoji, color: customRole.color, effect: customRole.effect }} size="xs" />}
              {customBadge && <CustomBadgeDisplay badge={customBadge} size="xs" />}
            </div>
          </div>

          {/* Name */}
          <div className="mb-3">
            <h2 className="font-heading font-extrabold text-lg sm:text-xl leading-tight">{user.name}</h2>
            {user.username && <p className="text-sm text-muted-foreground">@{user.username}</p>}
          </div>

          {/* EXP bar */}
          <div className="mb-3 p-3 rounded-2xl bg-secondary/60 border border-border/60 space-y-2">
            <div className="flex items-center justify-between">
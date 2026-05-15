import React from "react";
import { RAS_CONFIG, RARITY_LABEL } from "@/lib/rpgSystem";
import { motion } from "framer-motion";

// Badge ras kecil — tampil di komentar, profil, dll
export default function RasTitle({ ras, size = "xs", showRarity = false }) {
  const cfg = RAS_CONFIG[ras] || RAS_CONFIG.manusia;
  const sizeClass = size === "xs" ? "text-[9px] px-1.5 py-0" : size === "sm" ? "text-[10px] px-2 py-0.5" : "text-xs px-2.5 py-1";

  if (cfg.animated) {
    return (
      <motion.span
        className={`inline-flex items-center gap-0.5 rounded-full font-extrabold tracking-wide ${sizeClass} relative overflow-hidden select-none border ${cfg.border}`}
        style={{
          background: ras === "raja_iblis"
            ? "linear-gradient(90deg, #7f0000, #ff2200, #ff6600, #ff2200, #7f0000)"
            : "linear-gradient(90deg, #b8860b, #ffd700, #fffacd, #ffd700, #b8860b)",
          backgroundSize: "200% 100%",
          color: "#fff",
          textShadow: ras === "raja_iblis" ? "0 0 8px #ff2200" : "0 0 8px #ffd700",
          boxShadow: ras === "raja_iblis" ? "0 0 8px 2px #ff220066" : "0 0 8px 2px #ffd70066",
        }}
        animate={{ backgroundPosition: ["0% 50%", "200% 50%", "0% 50%"] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
      >
        {cfg.emoji} {cfg.label}
      </motion.span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-0.5 rounded-full font-extrabold tracking-wide ${sizeClass} ${cfg.bg} ${cfg.color} border ${cfg.border} ${cfg.glow ? `shadow-sm ${cfg.glow}` : ""}`}>
      {cfg.emoji} {cfg.label}
      {showRarity && <span className={`ml-1 opacity-60 ${RARITY_LABEL[cfg.rarity]?.color}`}>·{RARITY_LABEL[cfg.rarity]?.label}</span>}
    </span>
  );
}
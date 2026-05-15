import React from "react";
import { motion } from "framer-motion";
import { getRankByLevel } from "@/lib/rankSystem";

export default function RankBadge({ level = 1, size = "sm" }) {
  const rank = getRankByLevel(level);
  const sizeClass = size === "xs" ? "text-[9px] px-1.5 py-0" : "text-[10px] px-2 py-0.5";

  if (!rank.animated) {
    return (
      <span className={`inline-flex items-center gap-0.5 rounded-full font-extrabold tracking-wide ${sizeClass} ${rank.bg} ${rank.color} border ${rank.border}`}>
        {rank.emoji} {rank.name}
      </span>
    );
  }

  if (rank.animStyle === "rainbow") {
    return (
      <motion.span
        className={`inline-flex items-center gap-0.5 rounded-full font-extrabold tracking-wide ${sizeClass} relative overflow-hidden select-none text-white`}
        style={{
          background: "linear-gradient(90deg, #ec4899, #a855f7, #3b82f6, #a855f7, #ec4899)",
          backgroundSize: "300% 100%",
          boxShadow: "0 0 12px 2px #a855f788",
        }}
        animate={{ backgroundPosition: ["0% 50%", "300% 50%", "0% 50%"] }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
      >
        {rank.emoji} {rank.name}
      </motion.span>
    );
  }

  if (rank.animStyle === "gold-glow") {
    return (
      <motion.span
        className={`inline-flex items-center gap-0.5 rounded-full font-extrabold tracking-wide ${sizeClass} text-yellow-200 select-none`}
        style={{ background: "linear-gradient(90deg, #f59e0b, #fde047, #f59e0b)", backgroundSize: "200% 100%" }}
        animate={{
          backgroundPosition: ["0% 50%", "200% 50%", "0% 50%"],
          boxShadow: ["0 0 6px 1px #f59e0b88", "0 0 14px 4px #fde047cc", "0 0 6px 1px #f59e0b88"],
        }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      >
        {rank.emoji} {rank.name}
      </motion.span>
    );
  }

  if (rank.animStyle === "purple-glow") {
    return (
      <motion.span
        className={`inline-flex items-center gap-0.5 rounded-full font-extrabold tracking-wide ${sizeClass} text-white select-none`}
        style={{ background: "linear-gradient(90deg, #9333ea, #ec4899, #9333ea)", backgroundSize: "200% 100%" }}
        animate={{
          backgroundPosition: ["0% 50%", "200% 50%", "0% 50%"],
          boxShadow: ["0 0 6px 2px #9333ea88", "0 0 12px 4px #ec489988", "0 0 6px 2px #9333ea88"],
        }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
      >
        {rank.emoji} {rank.name}
      </motion.span>
    );
  }

  // cyan-glow
  return (
    <motion.span
      className={`inline-flex items-center gap-0.5 rounded-full font-extrabold tracking-wide ${sizeClass} text-white select-none`}
      style={{ background: "linear-gradient(90deg, #06b6d4, #3b82f6, #06b6d4)", backgroundSize: "200% 100%" }}
      animate={{
        backgroundPosition: ["0% 50%", "200% 50%", "0% 50%"],
        boxShadow: ["0 0 6px 2px #06b6d488", "0 0 12px 4px #3b82f688", "0 0 6px 2px #06b6d488"],
      }}
      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
    >
      {rank.emoji} {rank.name}
    </motion.span>
  );
}
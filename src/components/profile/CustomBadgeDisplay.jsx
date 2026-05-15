import React from "react";
import { motion } from "framer-motion";

/**
 * Renders a custom admin badge with optional visual effects.
 * badge = { title, emoji, color, effect? }
 * size = "xs" | "sm"
 */
export default function CustomBadgeDisplay({ badge, size = "sm" }) {
  if (!badge) return null;
  const { title, emoji, color, effect = "none" } = badge;
  const cls = size === "xs" ? "text-[9px] px-1.5 py-0 gap-0.5" : "text-[10px] px-2 py-0.5 gap-0.5";

  const base = `inline-flex items-center rounded-full font-extrabold tracking-wide ${cls} border select-none`;

  switch (effect) {
    case "rainbow":
      return (
        <motion.span className={`${base}`}
          style={{ background: "linear-gradient(90deg, #ff0000, #ff6600, #ffcc00, #00cc00, #0066ff, #9900ff, #ff0000)", backgroundSize: "300% 100%", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", borderColor: color + "40" }}
          animate={{ backgroundPosition: ["0% 50%", "300% 50%"] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
        >{emoji} {title}</motion.span>
      );
    case "fire":
      return (
        <motion.span className={`${base} text-white`}
          style={{ background: "linear-gradient(90deg, #ff2200, #ff6600, #ffcc00, #ff2200)", backgroundSize: "200% 100%", textShadow: "0 0 6px #ff4400", boxShadow: "0 0 6px 1px #ff440055", borderColor: "#ff6600" }}
          animate={{ backgroundPosition: ["0% 50%", "200% 50%", "0% 50%"] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        >{emoji} {title}</motion.span>
      );
    case "sparkle":
      return (
        <motion.span className={base}
          style={{ color, borderColor: color + "60", background: color + "18" }}
          animate={{ opacity: [1, 0.45, 1] }}
          transition={{ duration: 0.9, repeat: Infinity }}
        >{emoji} {title}</motion.span>
      );
    case "glow":
      return (
        <motion.span className={base}
          style={{ color, borderColor: color + "60", background: color + "18" }}
          animate={{ boxShadow: [`0 0 3px 1px ${color}44`, `0 0 12px 4px ${color}88`, `0 0 3px 1px ${color}44`] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >{emoji} {title}</motion.span>
      );
    case "neon":
      return (
        <motion.span className={base}
          style={{ color, borderColor: color, background: color + "20", textShadow: `0 0 8px ${color}`, boxShadow: `0 0 10px ${color}55, inset 0 0 6px ${color}18` }}
          animate={{ opacity: [1, 0.75, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >{emoji} {title}</motion.span>
      );
    case "ice":
      return (
        <motion.span className={base}
          style={{ color: "#a5f3fc", borderColor: "#67e8f955", background: "linear-gradient(135deg, #0c4a6e22, #06b6d444)" }}
          animate={{ boxShadow: ["0 0 4px 1px #06b6d444", "0 0 14px 4px #06b6d477", "0 0 4px 1px #06b6d444"] }}
          transition={{ duration: 2, repeat: Infinity }}
        >{emoji} {title}</motion.span>
      );
    case "gold":
      return (
        <motion.span className={base}
          style={{ background: "linear-gradient(135deg, #78350f, #d97706, #fbbf24, #d97706)", backgroundSize: "200% 100%", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", borderColor: "#fbbf2455" }}
          animate={{ backgroundPosition: ["0% 50%", "200% 50%", "0% 50%"] }}
          transition={{ duration: 2, repeat: Infinity }}
        >{emoji} {title}</motion.span>
      );
    case "matrix":
      return (
        <motion.span className={base}
          style={{ color: "#4ade80", borderColor: "#16a34a55", background: "#14532d20", textShadow: "0 0 6px #4ade80" }}
          animate={{ opacity: [1, 0.6, 1, 0.8, 1] }}
          transition={{ duration: 1.2, repeat: Infinity }}
        >{emoji} {title}</motion.span>
      );
    case "galaxy":
      return (
        <motion.span className={base}
          style={{ background: "linear-gradient(90deg, #6366f1, #a855f7, #ec4899, #6366f1)", backgroundSize: "200% 100%", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", borderColor: "#a855f755" }}
          animate={{ backgroundPosition: ["0% 50%", "200% 50%"] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        >{emoji} {title}</motion.span>
      );
    case "blood":
      return (
        <motion.span className={base}
          style={{ color: "#fca5a5", borderColor: "#ef444455", background: "linear-gradient(135deg, #7f1d1d22, #dc262644)" }}
          animate={{ boxShadow: ["0 0 3px 1px #ef444422", "0 0 10px 3px #ef444466", "0 0 3px 1px #ef444422"] }}
          transition={{ duration: 1.8, repeat: Infinity }}
        >{emoji} {title}</motion.span>
      );
    case "electric":
      return (
        <motion.span className={base}
          style={{ color: "#fde047", borderColor: "#eab30855", background: "#78350f20", textShadow: "0 0 8px #fde047" }}
          animate={{ boxShadow: ["0 0 4px #fde04744", "0 0 16px 4px #fde04788", "0 0 4px #fde04744"], opacity: [1, 0.85, 1] }}
          transition={{ duration: 0.8, repeat: Infinity }}
        >{emoji} {title}</motion.span>
      );
    default:
      return (
        <span className={base} style={{ color, borderColor: color + "50", background: color + "15" }}>
          {emoji} {title}
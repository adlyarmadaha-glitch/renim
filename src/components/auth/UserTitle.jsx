import React from "react";
import { USER_TITLES } from "@/lib/auth";
import { motion } from "framer-motion";

export default function UserTitle({ role = "user", size = "sm" }) {
  const cfg = USER_TITLES[role] || USER_TITLES.user;
  const sizeClass = size === "xs" ? "text-[9px] px-1.5 py-0" : "text-[10px] px-2 py-0.5";

  if (role === "admin") {
    return (
      <motion.span
        className={["inline-flex items-center rounded-full font-extrabold tracking-wide select-none overflow-hidden", sizeClass].join(" ")}
        style={{
          background: "linear-gradient(90deg, #ff0000, #ff6600, #ffcc00, #ff6600, #ff0000)",
          backgroundSize: "200% 100%",
          color: "#fff",
          textShadow: "0 0 8px #ff4400",
          boxShadow: "0 0 8px 2px #ff440055",
        }}
        animate={{ backgroundPosition: ["0% 50%", "200% 50%", "0% 50%"] }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      >
        👑 Dewa
      </motion.span>
    );
  }

  if (role === "staff") {
    return (
      <motion.span
        className={["inline-flex items-center rounded-full font-extrabold tracking-wide select-none", sizeClass].join(" ")}
        style={{
          background: "linear-gradient(90deg, #06b6d4, #3b82f6, #06b6d4)",
          backgroundSize: "200% 100%",
          color: "#fff",
          textShadow: "0 0 6px #06b6d4",
        }}
        animate={{ backgroundPosition: ["0% 50%", "200% 50%", "0% 50%"] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
      >
        🛡️ Staf
      </motion.span>
    );
  }

  return (
    <span
      className={["inline-flex items-center rounded-full font-extrabold tracking-wide border border-current/20", sizeClass, cfg.bg, cfg.color].join(" ")}
    >
      🎌 {cfg.label}
    </span>
  );
}
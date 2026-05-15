const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState, useEffect, useRef } from "react";

import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";

const BUILTIN_EMOJIS = [
  "😀","😂","🥹","😍","🥰","😎","🤩","😭","😤","🤯",
  "👍","👎","❤️","🔥","💯","✨","🎉","👏","🙏","💪",
  "😏","🫡","🤔","😴","🥱","🤣","😇","😈","👿","💀",
  "⚡","🌟","🎯","🏆","👑","🎮","📺","🎬","🍜","🍙"
];

export default function EmojiPicker({ onSelect, onClose, anchorRef }) {
  const [customEmojis, setCustomEmojis] = useState([]);
  const [tab, setTab] = useState("builtin");
  const pickerRef = useRef(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    db.entities.CustomEmoji.list().then(setCustomEmojis).catch(() => {});
  }, []);

  // Calculate position relative to anchor button (fixed positioning)
  useEffect(() => {
    function calcPos() {
      if (!anchorRef?.current) return;
      const rect = anchorRef.current.getBoundingClientRect();
      const pickerH = 310;
      const pickerW = Math.min(288, window.innerWidth - 16);
      const spaceAbove = rect.top;
      const spaceBelow = window.innerHeight - rect.bottom;

      let top = spaceAbove >= pickerH || spaceAbove > spaceBelow
        ? rect.top - pickerH - 6
        : rect.bottom + 6;

      let left = rect.right - pickerW;
      if (left < 8) left = 8;
      if (left + pickerW > window.innerWidth - 8) left = window.innerWidth - pickerW - 8;
      // Clamp top
      if (top < 8) top = 8;
      if (top + pickerH > window.innerHeight - 8) top = window.innerHeight - pickerH - 8;

      setPos({ top, left });
    }
    calcPos();
    window.addEventListener("resize", calcPos);
    return () => window.removeEventListener("resize", calcPos);
  }, [anchorRef]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (
        pickerRef.current && !pickerRef.current.contains(e.target) &&
        anchorRef?.current && !anchorRef.current.contains(e.target)
      ) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, [onClose, anchorRef]);

  const picker = (
    <motion.div
      ref={pickerRef}
      initial={{ opacity: 0, scale: 0.95, y: 6 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 6 }}
      transition={{ duration: 0.12 }}
      style={{ position: "fixed", top: pos.top, left: pos.left, zIndex: 9999, width: Math.min(288, window.innerWidth - 16) }}
      className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Tabs */}
      <div className="flex border-b border-border">
        <button
          type="button"
          onClick={() => setTab("builtin")}
          className={`flex-1 py-2.5 text-xs font-semibold transition-colors ${tab === "builtin" ? "text-primary border-b-2 border-primary bg-primary/5" : "text-muted-foreground hover:text-foreground"}`}
        >
          😀 Emoji
        </button>
        <button
          type="button"
          onClick={() => setTab("custom")}
          className={`flex-1 py-2.5 text-xs font-semibold transition-colors ${tab === "custom" ? "text-primary border-b-2 border-primary bg-primary/5" : "text-muted-foreground hover:text-foreground"}`}
        >
          ✨ Kustom
        </button>
      </div>

      <div className="p-3 max-h-52 overflow-y-auto">
        {tab === "builtin" ? (
          <div className="grid grid-cols-8 gap-1">
            {BUILTIN_EMOJIS.map((em) => (
              <button
                key={em}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onSelect(em); }}
                className="w-8 h-8 flex items-center justify-center text-lg hover:bg-secondary rounded-lg transition-colors"
              >
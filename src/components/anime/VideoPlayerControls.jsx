import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FastForward } from "lucide-react";

/**
 * VideoPlayerControls — hanya tampilkan Skip Intro di luar player
 * Overlay di atas iframe DIHAPUS karena memblokir klik ke player
 * Kontrol play/pause bawaan player tetap berfungsi normal
 */
export default function VideoPlayerControls({
  selectedServerUrl,
  showSkipIntro,
  onDismissIntro,
  currentEpNum,
}) {
  if (!selectedServerUrl) return null;

  return (
    <AnimatePresence>
      {showSkipIntro && currentEpNum >= 2 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-yellow-500/10 border border-yellow-500/30"
        >
          <div className="flex items-center gap-2">
            <FastForward className="w-4 h-4 text-yellow-400 shrink-0" />
            <p className="text-sm text-yellow-300 font-semibold">Sedang intro — mau lewati?</p>
          </div>
          <button
            onClick={onDismissIntro}
            className="px-3 py-1 rounded-lg bg-yellow-500 text-black text-xs font-extrabold hover:bg-yellow-400 transition-colors shrink-0"
          >
            Lewati ⏭
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function SplashScreen({ onDone }) {
  const [phase, setPhase] = useState("in"); // "in" | "hold" | "out"
  const [show, setShow] = useState(true);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("hold"), 600);
    const t2 = setTimeout(() => setPhase("out"), 2200);
    const t3 = setTimeout(() => {
      setShow(false);
      onDone?.();
    }, 2900);

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  if (!show) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          animate={{ opacity: phase === "out" ? 0 : 1 }}
          transition={{ duration: 0.7 }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0a0a0a]"
        >
          {/* Background radial glow */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: phase === "out" ? 2 : 1.2, opacity: phase === "out" ? 0 : 0.15 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="w-72 h-72 rounded-full"
              style={{ background: "radial-gradient(circle, #7c3aed 0%, transparent 70%)" }}
            />
          </div>

          {/* Logo icon */}
          <motion.div
            initial={{ scale: 0.4, opacity: 0, y: 20 }}
            animate={{
              scale: phase === "in" ? 1 : phase === "hold" ? 1 : 1.05,
              opacity: phase === "in" ? 1 : 1,
              y: 0,
            }}
            transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
            className="relative mb-6"
          >
            {/* Animated ring */}
            <motion.div
              className="absolute -inset-4 rounded-full border-2 border-primary/30"
              animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.1, 0.4] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute -inset-8 rounded-full border border-primary/10"
              animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0, 0.2] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
            />

            {/* Logo */}
            <div className="relative w-24 h-24 rounded-3xl flex items-center justify-center shadow-2xl"
              style={{ background: "linear-gradient(135deg, #7c3aed 0%, #db2777 100%)" }}>
              <svg viewBox="0 0 80 80" className="w-14 h-14" fill="none">
                {/* Stylized "R" for Renime */}
                <motion.path
                  d="M20 20 L20 60 M20 20 L50 20 Q65 20 65 35 Q65 50 50 50 L20 50 M45 50 L65 60"
                  stroke="white" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.8, delay: 0.2, ease: "easeInOut" }}
                />
              </svg>
            </div>
          </motion.div>

          {/* App name */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="text-center"
          >
            <h1 className="text-4xl font-heading font-extrabold tracking-tight text-white">
              Renime
            </h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="text-sm text-white/40 mt-1 tracking-widest uppercase font-medium"
            >
              Anime · Donghua · Manga
            </motion.p>
          </motion.div>

          {/* Loading dots */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="absolute bottom-16 flex items-center gap-1.5"
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-primary"
                animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
                transition={{ duration: 1, repeat: Infinity, delay: i * 0.2, ease: "easeInOut" }}
              />
            ))}
          </motion.div>

          {/* Version */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            transition={{ delay: 1 }}
            className="absolute bottom-8 text-[11px] text-white/40"
          >
            v2.0.0
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
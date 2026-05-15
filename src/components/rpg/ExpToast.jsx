import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, TrendingUp } from "lucide-react";

// Toast muncul saat dapat EXP / level up
export default function ExpToast({ expResult, onDone }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => { setVisible(false); setTimeout(onDone, 300); }, 2800);
    return () => clearTimeout(t);
  }, []);

  if (!expResult) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
        >
          {expResult.leveledUp ? (
            <div className="flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-gradient-to-r from-primary to-accent text-white shadow-2xl shadow-primary/40 border border-white/10">
              <TrendingUp className="w-5 h-5" />
              <div>
                <p className="text-sm font-extrabold">Level Up! 🎉</p>
                <p className="text-xs opacity-80">Level {expResult.newLevel} tercapai! +{expResult.expGained} EXP</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card border border-primary/30 shadow-xl text-sm">
              <Zap className="w-4 h-4 text-primary" />
              <span className="font-bold text-primary">+{expResult.expGained} EXP</span>
              <span className="text-muted-foreground text-xs">{expResult.reason}</span>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
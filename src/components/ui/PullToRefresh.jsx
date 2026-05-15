import React, { useRef, useState, useCallback } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { RefreshCw } from "lucide-react";

const THRESHOLD = 72;

export default function PullToRefresh({ onRefresh, children }) {
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef(null);
  const pullY = useMotionValue(0);
  const iconOpacity = useTransform(pullY, [0, THRESHOLD], [0, 1]);
  const iconRotate = useTransform(pullY, [0, THRESHOLD], [0, 180]);
  const containerY = useTransform(pullY, [0, THRESHOLD], [0, THRESHOLD]);

  const canPull = useCallback(() => {
    return window.scrollY <= 0;
  }, []);

  const onTouchStart = useCallback((e) => {
    if (!canPull()) return;
    startY.current = e.touches[0].clientY;
  }, [canPull]);

  const onTouchMove = useCallback((e) => {
    if (startY.current === null || refreshing) return;
    const delta = e.touches[0].clientY - startY.current;
    if (delta > 0) {
      pullY.set(Math.min(delta * 0.5, THRESHOLD + 20));
    }
  }, [refreshing, pullY]);

  const onTouchEnd = useCallback(async () => {
    if (startY.current === null) return;
    startY.current = null;
    if (pullY.get() >= THRESHOLD && !refreshing) {
      setRefreshing(true);
      pullY.set(THRESHOLD);
      await onRefresh?.();
      setRefreshing(false);
    }
    pullY.set(0);
  }, [pullY, refreshing, onRefresh]);

  return (
    <div
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      className="relative"
    >
      {/* Pull indicator */}
      <motion.div
        style={{ opacity: iconOpacity }}
        className="absolute top-0 left-0 right-0 flex justify-center pointer-events-none z-10"
        aria-hidden="true"
      >
        <div className="flex items-center gap-2 text-primary bg-primary/10 border border-primary/20 rounded-full px-3 py-1.5 mt-1 text-xs font-semibold shadow-sm">
          <motion.div style={{ rotate: iconRotate }}>
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
          </motion.div>
          {refreshing ? "Memperbarui..." : "Tarik untuk refresh"}
        </div>
      </motion.div>

      {/* Content */}
      <motion.div style={{ y: refreshing ? THRESHOLD : containerY }}>
        {children}
      </motion.div>
    </div>
  );
}
import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

// Map of pathname -> scroll position, persisted in memory across tab switches
const scrollPositions = new Map();

/**
 * Saves and restores scroll position per route pathname.
 * Call inside the component that wraps page content.
 */
export function useScrollRestore() {
  const location = useLocation();
  const prevPathRef = useRef(location.pathname);

  // Save scroll before navigating away
  useEffect(() => {
    const handleScroll = () => {
      scrollPositions.set(prevPathRef.current, window.scrollY);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Restore scroll when pathname changes
  useEffect(() => {
    const saved = scrollPositions.get(location.pathname);
    if (saved !== undefined) {
      // Small delay so content has time to paint before scroll
      requestAnimationFrame(() => {
        window.scrollTo({ top: saved, behavior: "instant" });
      });
    } else {
      window.scrollTo({ top: 0, behavior: "instant" });
    }
    prevPathRef.current = location.pathname;
  }, [location.pathname]);
}
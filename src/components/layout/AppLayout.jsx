import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Navbar from "./Navbar";
import BottomTab from "./BottomTab";
import AnnouncementBanner from "@/components/announcement/AnnouncementBanner";
import { Tv } from "lucide-react";
import { useBackHandler } from "@/hooks/useBackHandler";
import { useScrollRestore } from "@/hooks/useScrollRestore";

export default function AppLayout() {
  const location = useLocation();
  useBackHandler();
  useScrollRestore();

  return (
    <div className="min-h-screen bg-background" style={{ paddingTop: "env(safe-area-inset-top)", paddingLeft: "env(safe-area-inset-left)", paddingRight: "env(safe-area-inset-right)" }}>
      <Navbar />
      <AnnouncementBanner />
      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 pb-24 md:pb-12">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={location.pathname + location.search}
            initial={{ x: 32, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -32, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      <footer className="border-t border-border mt-10 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col items-center gap-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Tv className="w-4 h-4 text-white" />
            </div>
            <span className="font-heading font-extrabold text-base tracking-tight">
              Re<span className="text-primary">nime</span>
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Renime — Nonton Anime Sub Indo Gratis
          </p>
        </div>
      </footer>
      <BottomTab />
    </div>
  );
}
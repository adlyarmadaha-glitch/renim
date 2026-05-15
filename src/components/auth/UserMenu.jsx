import React, { useState, useRef, useEffect } from "react";
import { firebaseAuth } from "@/lib/firebaseAuth";
import { Link } from "react-router-dom";
import { LogOut, Settings, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import UserTitle from "@/components/auth/UserTitle";

export default function UserMenu({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    firebaseAuth.logout();
    onLogout?.();
    setOpen(false);
  };

  const initial = (user.name || user.email || "U")[0].toUpperCase();

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 px-2 py-1.5 rounded-xl hover:bg-secondary transition-colors"
      >
        {/* Avatar */}
        <div className="w-7 h-7 rounded-full overflow-hidden bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-xs font-bold shrink-0 ring-2 ring-border">
          {user.avatar
            ? <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
            : initial}
        </div>
        <div className="hidden sm:flex flex-col items-start">
          <span className="text-xs font-semibold max-w-[70px] truncate leading-none">{user.name || user.email}</span>
          <UserTitle role={user.role} size="xs" />
        </div>
        <ChevronDown className={`w-3 h-3 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.95 }}
            className="absolute right-0 top-full mt-2 w-52 bg-card border border-border rounded-xl shadow-2xl shadow-black/40 overflow-hidden z-50"
          >
            {/* Profile info */}
            <div className="px-3 py-3 border-b border-border flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-sm font-bold shrink-0">
                {user.avatar
                  ? <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  : initial}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate">{user.name || "User"}</p>
                {user.username && <p className="text-xs text-muted-foreground truncate">@{user.username}</p>}
                <UserTitle role={user.role} size="xs" />
              </div>
            </div>

            <div className="p-1">
              <Link to="/settings" onClick={() => setOpen(false)} className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm hover:bg-secondary transition-colors">
                <Settings className="w-4 h-4 text-muted-foreground" />
                Profil & Setelan
              </Link>
              <button onClick={handleLogout} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm hover:bg-destructive/10 hover:text-destructive transition-colors text-left">
                <LogOut className="w-4 h-4" />
                Keluar
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
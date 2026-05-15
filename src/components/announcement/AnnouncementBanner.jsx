import React, { useState, useEffect, useMemo } from "react";
import { fsDb } from "@/lib/firestore";
import UserTitle from "@/components/auth/UserTitle";
import { X, Info, AlertTriangle, CheckCircle2, Flame, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const TYPE_CONFIG = {
  info:    { icon: Info,          bg: "from-blue-500/15 to-blue-500/5",     border: "border-blue-500/30",   text: "text-blue-400",   dot: "bg-blue-400",   badge: "bg-blue-500/20 text-blue-400" },
  warning: { icon: AlertTriangle, bg: "from-yellow-500/15 to-yellow-500/5", border: "border-yellow-500/30", text: "text-yellow-400", dot: "bg-yellow-400", badge: "bg-yellow-500/20 text-yellow-400" },
  success: { icon: CheckCircle2,  bg: "from-green-500/15 to-green-500/5",   border: "border-green-500/30",  text: "text-green-400",  dot: "bg-green-400",  badge: "bg-green-500/20 text-green-400" },
  hot:     { icon: Flame,         bg: "from-orange-500/15 to-orange-500/5", border: "border-orange-500/30", text: "text-orange-400", dot: "bg-orange-400", badge: "bg-orange-500/20 text-orange-400" },
};

function AuthorAvatar({ authorId, authorName }) {
  const src = useMemo(() => {
    if (!authorId) return null;
    try {
      const users = JSON.parse(localStorage.getItem("renime_users") || "[]");
      return users.find((x) => x.id === authorId)?.avatar || null;
    } catch { return null; }
  }, [authorId]);

  if (src) return <img src={src} alt={authorName} className="w-5 h-5 rounded-full object-cover ring-1 ring-white/20 shrink-0" />;
  return (
    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-[9px] font-bold shrink-0">
      {(authorName || "A")[0].toUpperCase()}
    </div>
  );
}

export default function AnnouncementBanner() {
  const [list, setList] = useState([]);
  const [dismissed, setDismissed] = useState(() => {
    try { return JSON.parse(localStorage.getItem("renime_dismissed_ann") || "[]"); } catch { return []; }
  });
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    // Real-time via Firestore
    const unsub = fsDb.Announcement.subscribe((docs) => setList(docs));
    return unsub;
  }, []);

  const visible = list.filter((a) => !dismissed.includes(a.id));
  if (visible.length === 0) return null;

  const safeIdx = Math.min(idx, visible.length - 1);
  const a = visible[safeIdx];
  const cfg = TYPE_CONFIG[a.type] || TYPE_CONFIG.info;
  const Icon = cfg.icon;

  const dismiss = (id) => {
    const next = [...dismissed, id];
    setDismissed(next);
    localStorage.setItem("renime_dismissed_ann", JSON.stringify(next));
    setIdx(0);
  };

  return (
    <AnimatePresence>
      <motion.div
        key={a.id}
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        className={`border-b ${cfg.border} bg-gradient-to-r ${cfg.bg} backdrop-blur-sm`}
      >
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center gap-2.5">
          <div className="relative shrink-0">
            <span className={`absolute inset-0 rounded-full ${cfg.dot} opacity-40 animate-ping`} />
            <span className={`relative flex items-center justify-center w-5 h-5 rounded-full ${cfg.badge}`}>
              <Icon className={`w-3 h-3 ${cfg.text}`} />
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <AuthorAvatar authorId={a.authorId} authorName={a.authorName} />
            <span className="text-xs font-bold hidden sm:block">{a.authorName}</span>
            <UserTitle role={a.authorRole || "admin"} size="xs" />
          </div>

          <span className="text-muted-foreground/50 text-xs hidden sm:block">›</span>

          <p className="text-sm text-foreground flex-1 leading-snug font-medium truncate">{a.text}</p>

          {visible.length > 1 && (
            <div className="flex items-center gap-1 shrink-0">
              <button onClick={() => setIdx(i => Math.max(0, i - 1))} disabled={safeIdx === 0}
                className="w-5 h-5 flex items-center justify-center rounded text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors">
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="text-[10px] font-bold text-muted-foreground min-w-[2rem] text-center">{safeIdx + 1}/{visible.length}</span>
              <button onClick={() => setIdx(i => Math.min(visible.length - 1, i + 1))} disabled={safeIdx === visible.length - 1}
                className="w-5 h-5 flex items-center justify-center rounded text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors">
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <button onClick={() => dismiss(a.id)}
            className={`shrink-0 w-5 h-5 flex items-center justify-center rounded-full ${cfg.badge} ${cfg.text} hover:opacity-80 transition-opacity`}>
            <X className="w-2.5 h-2.5" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
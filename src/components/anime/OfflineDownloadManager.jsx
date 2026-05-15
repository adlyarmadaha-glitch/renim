import React, { useState, useEffect } from "react";
import { Download, HardDrive, Trash2, CheckCircle2, ExternalLink, Lock, LogIn } from "lucide-react";
import { authStorage } from "@/lib/auth";
import AuthModal from "@/components/auth/AuthModal";
import { AnimatePresence as AP2 } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";

const OFFLINE_KEY = "renime_offline";

function getOfflineList() {
  try { return JSON.parse(localStorage.getItem(OFFLINE_KEY) || "[]"); } catch { return []; }
}
function saveOfflineList(list) {
  localStorage.setItem(OFFLINE_KEY, JSON.stringify(list));
}

export function useOfflineList() {
  const [list, setList] = useState(getOfflineList);
  const refresh = () => setList(getOfflineList());
  return { list, refresh };
}

export default function OfflineDownloadManager({ episodeId, animeTitle, episodeTitle, downloadQualities = [] }) {
  const [saved, setSaved] = useState(false);
  const [selectedLinks, setSelectedLinks] = useState([]);
  const [user, setUser] = useState(() => authStorage.getUser());
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    const handler = () => setUser(authStorage.getUser());
    window.addEventListener("renime-auth-change", handler);
    return () => window.removeEventListener("renime-auth-change", handler);
  }, []);

  useEffect(() => {
    const list = getOfflineList();
    setSaved(list.some((item) => item.episodeId === episodeId));
  }, [episodeId]);

  const saveForOffline = (url, quality, serverName) => {
    const list = getOfflineList().filter((i) => i.episodeId !== episodeId);
    list.unshift({
      episodeId,
      animeTitle,
      episodeTitle,
      url,
      quality,
      serverName,
      savedAt: new Date().toISOString(),
    });
    if (list.length > 30) list.splice(30);
    saveOfflineList(list);
    setSaved(true);
  };

  const removeOffline = () => {
    const list = getOfflineList().filter((i) => i.episodeId !== episodeId);
    saveOfflineList(list);
    setSaved(false);
  };

  if (downloadQualities.length === 0) return null;

  if (!user) {
    return (
      <>
        <div className="flex flex-col items-center gap-3 py-5 text-center">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Lock className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="font-semibold text-sm">Login untuk download episode</p>
            <p className="text-xs text-muted-foreground mt-0.5">Gratis! Daftar dan nikmati semua fitur</p>
          </div>
          <button onClick={() => setShowAuth(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-bold text-sm shadow-lg shadow-primary/25">
            <LogIn className="w-4 h-4" /> Masuk / Daftar
          </button>
        </div>
        <AP2>
          {showAuth && (
            <AuthModal
              onClose={() => setShowAuth(false)}
              onSuccess={(u) => { setUser(u); setShowAuth(false); window.dispatchEvent(new Event("renime-auth-change")); }}
            />
          )}
        </AP2>
      </>
    );
  }

  return (
    <div className="space-y-4">
      {/* Offline saved indicator */}
      <AnimatePresence>
        {saved && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="flex items-center justify-between px-4 py-3 rounded-xl bg-green-500/10 border border-green-500/25"
          >
            <div className="flex items-center gap-2 text-green-400 text-sm font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              Link tersimpan untuk offline
            </div>
            <Button size="sm" variant="ghost" onClick={removeOffline} className="text-xs text-muted-foreground h-7 gap-1">
              <Trash2 className="w-3 h-3" /> Hapus
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quality groups */}
      <div className="space-y-3">
        {downloadQualities.map((q) => (
          <div key={q.title} className="rounded-xl border border-border overflow-hidden">
            {/* Quality header */}
            <div className="flex items-center gap-3 px-4 py-2.5 bg-secondary/60 border-b border-border">
              <div className="w-6 h-6 rounded-lg bg-primary/15 flex items-center justify-center">
                <Download className="w-3.5 h-3.5 text-primary" />
              </div>
              <span className="text-xs font-bold text-foreground">{q.title}</span>
              {q.size && <span className="text-xs text-muted-foreground ml-auto">{q.size}</span>}
            </div>
            {/* Server links */}
            <div className="px-4 py-3 flex flex-wrap gap-2">
              {(q.urls || []).map((link, i) => (
                <div key={i} className="flex gap-1 items-center">
                  <a href={link.url} target="_blank" rel="noopener noreferrer">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs h-8 gap-1.5 border-border hover:border-primary/50 hover:text-primary"
                    >
                      <Download className="w-3 h-3" />
                      {link.title || `Server ${i + 1}`}
                    </Button>
                  </a>
                  <Button
                    size="sm"
                    variant="ghost"
                    title="Simpan ke offline"
                    onClick={() => saveForOffline(link.url, q.title, link.title || `Server ${i + 1}`)}
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-primary hover:bg-primary/10"
                  >
                    <HardDrive className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Standalone page/panel to show all offline saved episodes
export function OfflineList() {
  const { list, refresh } = useOfflineList();

  const remove = (episodeId) => {
    saveOfflineList(getOfflineList().filter((i) => i.episodeId !== episodeId));
    refresh();
  };

  if (list.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <HardDrive className="w-10 h-10 mx-auto mb-2 opacity-30" />
        <p className="text-sm">Belum ada episode yang disimpan offline</p>
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {list.map((item) => (
        <li key={item.episodeId} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/60 border border-border">
          <HardDrive className="w-4 h-4 text-primary shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">{item.animeTitle}</p>
            <p className="text-xs text-muted-foreground">{item.episodeTitle} · {item.quality} · {item.serverName}</p>
          </div>
          <div className="flex gap-1 shrink-0">
            <a href={item.url} target="_blank" rel="noopener noreferrer">
              <Button size="sm" variant="outline" className="h-7 px-2">
                <ExternalLink className="w-3 h-3" />
              </Button>
            </a>
            <Button size="sm" variant="ghost" className="h-7 px-2 text-destructive" onClick={() => remove(item.episodeId)}>
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </li>
      ))}
    </ul>
  );
}
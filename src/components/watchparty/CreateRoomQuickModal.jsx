/**
 * CreateRoomQuickModal — buat room langsung dari halaman episode,
 * tanpa perlu cari anime/episode (sudah otomatis terisi).
 */
import React, { useState } from "react";
import { watchPartyService } from "@/lib/watchParty";
import { nobarRankStorage } from "@/components/watchparty/NobarOtakuRank";
import { motion, AnimatePresence } from "framer-motion";
import { X, Popcorn, Users, Copy, Check, Globe, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CreateRoomQuickModal({ user, episodeId, animeTitle, episodeTitle, poster, onRoomCreated, onClose }) {
  const [isPublic, setIsPublic] = useState(true);
  const [loading, setLoading] = useState(false);
  const [roomId, setRoomId] = useState(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const handleCreate = async () => {
    setLoading(true);
    setError("");
    try {
      const id = await watchPartyService.createRoom({
        episodeId,
        animeTitle: animeTitle || "Anime",
        episodeTitle: episodeTitle || "Episode",
        poster: poster || "",
        host: user,
        isPublic,
      });
      setRoomId(id);
      nobarRankStorage.add(user.id, { exp: 30, roomCreated: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    const url = `${window.location.origin}/nonton-bareng/${roomId}`;
    navigator.clipboard.writeText(url).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" />
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 20 }}
        className="relative z-10 w-full max-w-sm bg-card border border-border rounded-2xl shadow-2xl p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/30 shrink-0">
            <Popcorn className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-heading font-bold text-base">Buat Room Nobar</h2>
            <p className="text-[10px] text-muted-foreground">Ajak teman nonton bareng episode ini</p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {!roomId ? (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              {/* Episode preview */}
              <div className="bg-secondary/60 rounded-xl p-3 flex items-center gap-3">
                {poster && <img src={poster} alt={animeTitle} className="w-10 h-14 rounded-lg object-cover shrink-0" />}
                <div className="min-w-0">
                  <p className="text-sm font-bold truncate">{animeTitle || "Anime"}</p>
                  <p className="text-xs text-muted-foreground truncate">{episodeTitle || "Episode"}</p>
                </div>
              </div>

              {/* Visibility */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground">Visibilitas Room</p>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => setIsPublic(true)}
                    className={`flex items-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all ${isPublic ? "bg-primary/10 border-primary/40 text-primary" : "border-border text-muted-foreground hover:bg-secondary"}`}>
                    <Globe className="w-3.5 h-3.5" /> Publik
                  </button>
                  <button onClick={() => setIsPublic(false)}
                    className={`flex items-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all ${!isPublic ? "bg-primary/10 border-primary/40 text-primary" : "border-border text-muted-foreground hover:bg-secondary"}`}>
                    <Lock className="w-3.5 h-3.5" /> Private
                  </button>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  {isPublic ? "Room terlihat di daftar publik lobby" : "Hanya bisa gabung dengan kode"}
                </p>
              </div>

              {error && <p className="text-xs text-destructive bg-destructive/10 rounded-lg px-3 py-2">{error}</p>}

              <Button className="w-full gap-2 bg-gradient-to-r from-primary to-accent font-bold" onClick={handleCreate} disabled={loading}>
                {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Users className="w-4 h-4" />}
                {loading ? "Membuat Room..." : "Buat Room Sekarang"}
              </Button>
            </motion.div>
          ) : (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4 text-center">
              <div className="text-4xl">🎉</div>
              <div>
                <p className="font-bold">Room Siap!</p>
                <p className="text-xs text-muted-foreground mt-0.5">Bagikan kode ke temanmu</p>
              </div>
              <div className="text-4xl font-heading font-extrabold tracking-[0.3em] text-primary">{roomId}</div>
              <div className="bg-secondary rounded-xl p-3 flex items-center gap-2">
                <p className="text-xs text-muted-foreground flex-1 truncate text-left">{window.location.origin}/nonton-bareng/{roomId}</p>
                <button onClick={handleCopy}
                  className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-bold hover:bg-primary/20 transition-all">
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? "Disalin!" : "Salin"}
                </button>
              </div>
              <Button className="w-full gap-2 bg-gradient-to-r from-primary to-accent" onClick={() => onRoomCreated(roomId)}>
                <Popcorn className="w-4 h-4" /> Masuk ke Room
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
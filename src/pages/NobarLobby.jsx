import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { watchPartyService } from "@/lib/watchParty";
import { authStorage } from "@/lib/auth";
import { motion, AnimatePresence } from "framer-motion";
import { Popcorn, Plus, Users, Wifi, Crown, Search, Globe, Clock, Tv, ChevronRight, LogIn, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AuthModal from "@/components/auth/AuthModal";
import CreateRoomModalFull from "@/components/watchparty/CreateRoomModalFull";
import JoinRoomModal from "@/components/watchparty/JoinRoomModal";
import NobarOtakuRank from "@/components/watchparty/NobarOtakuRank";

function timeAgo(ts) {
  if (!ts) return "";
  const d = ts?.toDate ? ts.toDate() : new Date(ts);
  const diff = Math.floor((Date.now() - d.getTime()) / 1000);
  if (diff < 60) return "Baru saja";
  if (diff < 3600) return `${Math.floor(diff / 60)} mnt lalu`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
  return `${Math.floor(diff / 86400)} hari lalu`;
}

function RoomCard({ room, onClick }) {
  const isActive = room.active;
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      onClick={onClick}
      className="cursor-pointer bg-card border border-border hover:border-primary/40 rounded-2xl overflow-hidden transition-all group"
    >
      <div className="flex gap-3 p-3">
        {/* Poster */}
        <div className="w-14 h-20 rounded-xl overflow-hidden bg-secondary shrink-0">
          {room.poster ? (
            <img src={room.poster} alt={room.animeTitle} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center"><Tv className="w-6 h-6 text-muted-foreground/30" /></div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-start justify-between gap-1">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate leading-tight">{room.animeTitle || "Anime"}</p>
              <p className="text-[11px] text-muted-foreground truncate">{room.episodeTitle || "Episode"}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary shrink-0 mt-0.5 transition-colors" />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {isActive ? (
              <span className="flex items-center gap-1 text-[10px] font-bold text-green-400 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-full">
                <Wifi className="w-2.5 h-2.5 animate-pulse" /> Live
              </span>
            ) : (
              <span className="text-[10px] text-muted-foreground border border-border px-2 py-0.5 rounded-full">Selesai</span>
            )}
            <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <Users className="w-2.5 h-2.5" /> {room.memberCount || 0}
            </span>
            <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <Clock className="w-2.5 h-2.5" /> {timeAgo(room.created_date)}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <Crown className="w-3 h-3 text-yellow-400" />
            <span className="text-[10px] text-muted-foreground truncate">{room.hostName}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function NobarLobby() {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => authStorage.getUser());
  const [rooms, setRooms] = useState([]);
  const [myRooms, setMyRooms] = useState([]);
  const [tab, setTab] = useState("public");
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [loadingMyRooms, setLoadingMyRooms] = useState(false);

  useEffect(() => {
    const handler = () => setUser(authStorage.getUser());
    window.addEventListener("renime-auth-change", handler);
    return () => window.removeEventListener("renime-auth-change", handler);
  }, []);

  // Subscribe to public rooms
  useEffect(() => {
    const unsub = watchPartyService.subscribePublicRooms(setRooms);
    return unsub;
  }, []);

  // Load my rooms
  useEffect(() => {
    if (tab === "my" && user) {
      setLoadingMyRooms(true);
      watchPartyService.getMyRooms(user.id)
        .then(setMyRooms)
        .finally(() => setLoadingMyRooms(false));
    }
  }, [tab, user]);

  const searchLower = search.toLowerCase();
  const filtered = rooms.filter((r) =>
    !search ||
    r.animeTitle?.toLowerCase().includes(searchLower) ||
    r.hostName?.toLowerCase().includes(searchLower) ||
    r.episodeTitle?.toLowerCase().includes(searchLower)
  );

  const activeRooms = filtered.filter((r) => r.active);
  const closedRooms = filtered.filter((r) => !r.active);

  return (
    <div className="max-w-3xl mx-auto px-3 py-4 space-y-5">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary/10 via-card to-accent/5 border border-border rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/30">
            <Popcorn className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-heading font-extrabold text-lg leading-tight">🍿 Nonton Bareng</h1>
            <p className="text-xs text-muted-foreground">Tonton anime bareng teman secara realtime</p>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          <Button
            className="flex-1 gap-2 bg-gradient-to-r from-primary to-accent font-bold shadow-lg shadow-primary/25 min-w-[140px]"
            onClick={() => user ? setShowCreate(true) : setShowAuth(true)}
          >
            <Plus className="w-4 h-4" /> Buat Room
          </Button>
          <Button
            variant="outline"
            className="flex-1 gap-2 border-border hover:border-cyan-400/50 hover:text-cyan-400 hover:bg-cyan-500/5 min-w-[120px]"
            onClick={() => user ? setShowJoin(true) : setShowAuth(true)}
          >
            <LogIn className="w-4 h-4" /> Gabung Kode
          </Button>
        </div>
      </div>

      {/* Otaku Rank */}
      {user && <NobarOtakuRank userId={user.id} />}

      {/* Tabs */}
      <div className="flex gap-1 bg-secondary rounded-xl p-1">
        <button onClick={() => setTab("public")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${
            tab === "public" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
          }`}>
          <Globe className="w-3.5 h-3.5" /> Public
        </button>
        <button onClick={() => { setTab("my"); if (!user) setShowAuth(true); }}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${
            tab === "my" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
          }`}>
          <Crown className="w-3.5 h-3.5" /> Room Saya
        </button>
      </div>

      {/* Search (public tab) */}
      {tab === "public" && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Cari anime, host, atau episode..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-secondary border-secondary"
          />
        </div>
      )}

      {/* Public rooms */}
      {tab === "public" && (
        <div className="space-y-4">
          {activeRooms.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
                <Wifi className="w-3 h-3 text-green-400 animate-pulse" />
                Room Aktif ({activeRooms.length})
              </p>
              {activeRooms.map((r) => (
                <RoomCard key={r.id} room={r} onClick={() => { if (!user) { setShowAuth(true); return; } navigate(`/nonton-bareng/${r.roomId || r.id}`); }} />
              ))}
            </div>
          )}

          {activeRooms.length === 0 && !search && (
            <div className="text-center py-2">
              <p className="text-xs text-muted-foreground/50">Tidak ada room aktif saat ini</p>
            </div>
          )}

          {filtered.length === 0 && search && (
            <div className="text-center py-12 space-y-3">
              <Popcorn className="w-12 h-12 text-muted-foreground/20 mx-auto" />
              <p className="text-sm text-muted-foreground">Tidak ada room untuk "<span className="text-foreground font-semibold">{search}</span>"</p>
              <p className="text-xs text-muted-foreground/60">Coba kata kunci lain atau buat room baru</p>
            </div>
          )}
        </div>
      )}

      {/* My rooms */}
      {tab === "my" && (
        <div className="space-y-2">
          {!user ? (
            <div className="text-center py-10">
              <p className="text-sm text-muted-foreground">Login untuk melihat room kamu</p>
            </div>
          ) : loadingMyRooms ? (
            <div className="flex justify-center py-10">
              <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          ) : myRooms.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <Crown className="w-12 h-12 text-muted-foreground/20 mx-auto" />
              <p className="text-sm text-muted-foreground">Kamu belum pernah membuat room</p>
              <Button size="sm" onClick={() => setShowCreate(true)} className="gap-1.5">
                <Plus className="w-3.5 h-3.5" /> Buat Room Pertama
              </Button>
            </div>
          ) : (
            myRooms.map((r) => (
              <div key={r.id} className="relative group">
                <RoomCard room={r} onClick={() => r.active && navigate(`/nonton-bareng/${r.roomId || r.id}`)} />
                {!r.active && (
                  <button
                    onClick={async (e) => {
                      e.stopPropagation();
                      await watchPartyService.deleteRoom(r.roomId || r.id);
                      setMyRooms((prev) => prev.filter((x) => x.id !== r.id));
                    }}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg bg-destructive/10 hover:bg-destructive/20 text-destructive"
                    title="Hapus room"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Modals */}
      <AnimatePresence>
        {showCreate && (
          <CreateRoomModalFull
            user={user}
            onRoomCreated={(roomId) => { setShowCreate(false); navigate(`/nonton-bareng/${roomId}`); }}
            onClose={() => setShowCreate(false)}
          />
        )}
        {showJoin && (
          <JoinRoomModal
            user={user}
            onRoomJoined={(roomId) => { setShowJoin(false); navigate(`/nonton-bareng/${roomId}`); }}
            onClose={() => setShowJoin(false)}
          />
        )}
        {showAuth && (
          <AuthModal
            onClose={() => setShowAuth(false)}
            onSuccess={(u) => { setUser(u); setShowAuth(false); window.dispatchEvent(new Event("renime-auth-change")); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
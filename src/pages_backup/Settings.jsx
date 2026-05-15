import React, { useState, useEffect } from "react";
import {
  Sun, Moon, Settings as SettingsIcon, Trash2, Clock, Code2,
  HardDrive, User, Bell, Shield, BarChart2, Flame,
  Trophy, Star, Film, Zap, Sparkles, Circle, MessageSquare, Bug, UserX, LogOut
} from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import SupportModal from "@/components/support/SupportModal";
import RasTitle from "@/components/rpg/RasTitle";
import LevelBadge from "@/components/rpg/LevelBadge";
import RankBadge from "@/components/rpg/RankBadge";
import { rpgStorage, RAS_CONFIG, RARITY_LABEL, levelFromTotalExp } from "@/lib/rpgSystem";
import { orbStorage, GACHA_COST } from "@/lib/orbSystem";
import { Button } from "@/components/ui/button";
import { historyStorage, bookmarkStorage } from "@/lib/localStorage";
import RemindersSection from "@/components/schedule/RemindersSection";
import { OfflineList } from "@/components/anime/OfflineDownloadManager";
import { authStorage } from "@/lib/auth";
import ProfileSettings from "@/components/profile/ProfileSettings";
import AnnouncementManager from "@/components/announcement/AnnouncementManager";
import { AnimatePresence, motion } from "framer-motion";
import AuthModal from "@/components/auth/AuthModal";
import GachaModal from "@/components/rpg/GachaModal";
import { Link } from "react-router-dom";

const THEME_KEY = "renime_theme";

export function useTheme() {
  const getInitialTheme = () => {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved) return saved;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  };

  const [theme, setThemeState] = useState(getInitialTheme);
  const [isSystemMode, setIsSystemMode] = useState(() => !localStorage.getItem(THEME_KEY));

  // Listen to system preference changes when in auto mode
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e) => {
      if (isSystemMode) {
        setThemeState(e.matches ? "dark" : "light");
      }
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [isSystemMode]);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "light") { root.classList.remove("dark"); root.classList.add("light"); }
    else { root.classList.remove("light"); root.classList.add("dark"); }
    if (!isSystemMode) localStorage.setItem(THEME_KEY, theme);
  }, [theme, isSystemMode]);

  const setTheme = (newTheme) => {
    setIsSystemMode(false);
    localStorage.setItem(THEME_KEY, newTheme);
    setThemeState(newTheme);
  };

  const setSystemTheme = () => {
    setIsSystemMode(true);
    localStorage.removeItem(THEME_KEY);
    setThemeState(window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  };

  return { theme, setTheme, isSystemMode, setSystemTheme };
}

function StatCard({ icon: Icon, label, value, color = "text-primary" }) {
  return (
    <div className="bg-secondary/60 rounded-xl p-3 flex flex-col items-center gap-1 text-center">
      <Icon className={`w-5 h-5 ${color}`} />
      <span className="text-lg font-extrabold">{value}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}

export default function Settings() {
  const { theme, setTheme, isSystemMode, setSystemTheme } = useTheme();
  const [history, setHistory] = useState(() => historyStorage.list());
  const [user, setUser] = useState(() => authStorage.getUserSync?.() || null);
  const [showAuth, setShowAuth] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showGacha, setShowGacha] = useState(false);
  const [showDeleteAccountDialog, setShowDeleteAccountDialog] = useState(false);
  const [showSupport, setShowSupport] = useState(false);
  const [orbs, setOrbs] = useState(() => { const u = authStorage.getUserSync?.() || null; return u ? orbStorage.get(u.id) : 0; });
  const bookmarks = bookmarkStorage.list ? bookmarkStorage.list() : [];

  useEffect(() => {
    const handler = (e) => {
      if (e.detail?.userId === user?.id) setOrbs(orbStorage.get(user.id));
    };
    window.addEventListener("renime-orb-change", handler);
    return () => window.removeEventListener("renime-orb-change", handler);
  }, [user]);

  useEffect(() => {
    // Load fresh user from Firebase on mount
    authStorage.getUserAsync?.()?.then(u => { if (u) setUser(u); });
  }, []);

  useEffect(() => {
    const handler = () => { const u = authStorage.getUser(); setUser(u); };
    window.addEventListener("renime-auth-change", handler);
    return () => window.removeEventListener("renime-auth-change", handler);
  }, []);

  const clearHistory = () => { historyStorage.clear(); setHistory([]); };

  const handleUserUpdate = (updated) => {
    setUser(updated);
    window.dispatchEvent(new Event("renime-auth-change"));
  };

  const handleDeleteAccount = async (permanent = false) => {
    if (permanent) {
      historyStorage.clear();
      if (bookmarkStorage.clear) bookmarkStorage.clear();
      await authStorage.deleteAccount();
    } else {
      authStorage.logout();
    }
    window.dispatchEvent(new Event("renime-auth-change"));
    setUser(null);
    setShowDeleteConfirm(false);
  };

  // RPG data
  const rpgData = user ? rpgStorage.get(user.id) : null;
  const ras = rpgData?.ras || "manusia";
  const rasCfg = RAS_CONFIG[ras];
  const totalExp = rpgData?.totalExp || 0;
  const { level, currentExp, nextLevelExp } = levelFromTotalExp(totalExp);
  const pct = Math.min(100, Math.floor((currentExp / nextLevelExp) * 100));

  // Stats
  const totalWatched = history.length;
  const uniqueAnime = new Set(history.map((h) => h.anime_id)).size;
  const totalBookmarks = bookmarks.length;

  return (
    <div className="max-w-lg mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-heading font-bold flex items-center gap-2">
          <SettingsIcon className="w-6 h-6 text-primary" />
          Pengaturan
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Sesuaikan tampilan dan preferensi kamu</p>
      </div>

      {/* Admin Announcement Manager */}
      <AnnouncementManager />

      {/* Profile Section */}
      <section className="bg-card border border-border rounded-2xl p-5 space-y-4">
        <h2 className="text-sm font-bold flex items-center gap-2">
          <User className="w-4 h-4 text-primary" />
          Profil Saya
        </h2>
        {user ? (
          <ProfileSettings user={user} onUpdate={handleUserUpdate} />
        ) : (
          <div className="text-center py-4 space-y-3">
            <p className="text-sm text-muted-foreground">Login untuk mengatur profil kamu</p>
            <Button size="sm" onClick={() => setShowAuth(true)} className="gap-2 bg-primary hover:bg-primary/90">
              Masuk / Daftar
            </Button>
          </div>
        )}
      </section>

      {/* RPG Card */}
      {user && rpgData && (
        <section className={`bg-card border rounded-2xl p-5 space-y-4 ${rasCfg?.border || "border-border"}`}>
          <h2 className="text-sm font-bold flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" />
            Status RPG
            <span className="ml-auto"><RasTitle ras={ras} size="xs" /></span>
          </h2>

          {/* Ras info */}
          <div className={`px-3 py-2.5 rounded-xl ${rasCfg?.bg || "bg-secondary/60"} border ${rasCfg?.border || "border-border"}`}>
            <p className={`text-xs font-bold ${rasCfg?.color} mb-0.5`}>
              {rasCfg?.emoji} {rasCfg?.label} — <span className={RARITY_LABEL[rasCfg?.rarity]?.color}>{RARITY_LABEL[rasCfg?.rarity]?.label}</span>
            </p>
            <p className="text-xs text-muted-foreground">{rasCfg?.desc}</p>
          </div>

          {/* Rank badge */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Rank:</span>
            <RankBadge level={level} size="sm" />
          </div>

          {/* Level bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold">Level {level}</span>
              <span className="text-xs text-muted-foreground">{currentExp} / {nextLevelExp} EXP</span>
            </div>
            <div className="h-2.5 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">Total: <span className="text-foreground font-semibold">{totalExp} EXP</span></p>
          </div>

          {/* ORB & Gacha */}
          <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-xl">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-lg shadow-purple-500/30 shrink-0">
              <Circle className="w-4 h-4 text-white fill-current" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">Orb Kamu</p>
              <p className="font-extrabold text-foreground">{orbs} <span className="text-xs font-normal text-muted-foreground">Orb</span></p>
              <div className="w-full h-1.5 bg-muted rounded-full mt-1 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full" style={{ width: `${Math.min(100, (orbs / GACHA_COST) * 100)}%` }} />
              </div>
            </div>
            <Button size="sm" onClick={() => setShowGacha(true)}
              className="gap-1.5 bg-gradient-to-r from-purple-600 to-blue-500 text-white font-bold text-xs shrink-0">
              <Sparkles className="w-3.5 h-3.5" /> Gacha
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
            <div className="bg-secondary/60 rounded-xl p-2.5 text-center">
              <p className="text-base font-extrabold text-foreground">+30</p>
              <p>EXP + 1 Orb / Episode</p>
            </div>
            <div className="bg-secondary/60 rounded-xl p-2.5 text-center">
              <p className="text-base font-extrabold text-foreground">+12</p>
              <p>EXP + 1 Orb / Chapter</p>
            </div>
          </div>
        </section>
      )}

      {/* Statistik Nonton */}
      <section className="bg-card border border-border rounded-2xl p-5 space-y-4">
        <h2 className="text-sm font-bold flex items-center gap-2">
          <BarChart2 className="w-4 h-4 text-primary" />
          Statistik Saya
        </h2>
        <div className="grid grid-cols-3 gap-3">
          <StatCard icon={Film} label="Episode Ditonton" value={totalWatched} color="text-blue-400" />
          <StatCard icon={Star} label="Anime Unik" value={uniqueAnime} color="text-yellow-400" />
          <StatCard icon={Trophy} label="Di Bookmark" value={totalBookmarks} color="text-pink-400" />
        </div>
        {totalWatched > 0 && (
          <div className="flex items-center gap-2 mt-1 px-3 py-2 rounded-xl bg-primary/5 border border-primary/15">
            <Flame className="w-4 h-4 text-orange-400" />
            <p className="text-xs text-muted-foreground">
              Kamu udah nonton <span className="text-foreground font-semibold">{totalWatched} episode</span> dari <span className="text-foreground font-semibold">{uniqueAnime} anime</span> berbeda! 🎉
            </p>
          </div>
        )}
      </section>

      {/* Theme */}
      <section className="bg-card border border-border rounded-2xl p-5 space-y-4">
        <h2 className="text-sm font-bold text-foreground">Tampilan</h2>
        <div className="flex gap-2">
          {[{ value: "dark", label: "Gelap", icon: Moon }, { value: "light", label: "Terang", icon: Sun }].map((opt) => {
            const Icon = opt.icon;
            const isSelected = !isSystemMode && theme === opt.value;
            return (
              <button key={opt.value} onClick={() => setTheme(opt.value)}
                className={`flex-1 flex flex-col items-center gap-2 p-4 min-h-[72px] rounded-xl border-2 transition-all ${
                  isSelected ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-foreground/30"
                }`}>
                <Icon className="w-5 h-5" />
                <span className="text-sm font-semibold">{opt.label}</span>
              </button>
            );
          })}
          <button onClick={setSystemTheme}
            className={`flex-1 flex flex-col items-center gap-2 p-4 min-h-[72px] rounded-xl border-2 transition-all ${
              isSystemMode ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-foreground/30"
            }`}>
            <SettingsIcon className="w-5 h-5" />
            <span className="text-sm font-semibold">Otomatis</span>
          </button>
        </div>
        {isSystemMode && (
          <p className="text-xs text-muted-foreground text-center">Mengikuti tema sistem perangkat kamu</p>
        )}
      </section>

      {/* History */}
      <section className="bg-card border border-border rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            Riwayat Nonton
            <span className="text-xs font-normal text-muted-foreground">({history.length})</span>
          </h2>
          {history.length > 0 && (
            <Button size="sm" variant="destructive" className="text-xs h-7 gap-1" onClick={clearHistory}>
              <Trash2 className="w-3 h-3" /> Hapus
            </Button>
          )}
        </div>
        {history.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Film className="w-10 h-10 mx-auto mb-2 opacity-20" />
            <p className="text-sm">Belum ada riwayat nonton</p>
            <p className="text-xs mt-1 opacity-60">Tonton anime untuk melihat riwayat di sini</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2.5 max-h-80 overflow-y-auto pr-1">
            {[...history].reverse().map((item) => (
              <Link key={item.id} to={`/episode/${encodeURIComponent(item.episode_id)}`}
                state={{ animeId: item.anime_id, animeTitle: item.anime_title, poster: item.poster }}
                className="flex items-center gap-3 p-2.5 rounded-xl bg-secondary/60 hover:bg-secondary transition-colors group border border-transparent hover:border-primary/20">
                <div className="relative shrink-0">
                  {item.poster
                    ? <img src={item.poster} alt={item.anime_title} className="w-12 h-16 object-cover rounded-lg" />
                    : <div className="w-12 h-16 rounded-lg bg-muted flex items-center justify-center"><Film className="w-5 h-5 text-muted-foreground/40" /></div>
                  }
                  <div className="absolute inset-0 bg-black/40 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Trophy className="w-4 h-4 text-white" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate group-hover:text-primary transition-colors">{item.anime_title}</p>
                  <p className="text-xs text-primary/80 font-medium">{item.episode_title}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" />
                    {new Date(item.watched_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
                <div className="shrink-0 text-muted-foreground/30 group-hover:text-primary/50 transition-colors">
                  <Trophy className="w-4 h-4" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Reminders */}
      <section className="bg-card border border-border rounded-2xl p-5 space-y-4">
        <h2 className="text-sm font-bold flex items-center gap-2">
          <Bell className="w-4 h-4 text-primary" />
          Pengingat Anime
        </h2>
        <RemindersSection />
      </section>

      {/* Offline */}
      <section className="bg-card border border-border rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <HardDrive className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-bold">Download Offline</h2>
        </div>
        <OfflineList />
      </section>

      {/* Keamanan */}
      {user && (
        <section className="bg-card border border-border rounded-2xl p-5 space-y-4">
          <h2 className="text-sm font-bold flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            Keamanan & Akun
          </h2>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/60">
              <div>
                <p className="text-sm font-semibold">Email</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
              <span className="text-xs text-green-400 font-semibold">Terverifikasi</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/60">
              <div>
                <p className="text-sm font-semibold">Bergabung sejak</p>
                <p className="text-xs text-muted-foreground">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "—"}
                </p>
              </div>
            </div>
          </div>
          <div className="pt-2 border-t border-border space-y-2">
            {/* Logout */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors w-full">
                  <LogOut className="w-3.5 h-3.5" /> Keluar dari akun ini
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Keluar dari akun?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Kamu akan logout dari akun ini. Data lokal (riwayat, bookmark) tetap tersimpan di perangkat.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Batal</AlertDialogCancel>
                  <AlertDialogAction onClick={() => handleDeleteAccount(false)}>Ya, Keluar</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {/* Delete Account */}
            <AlertDialog open={showDeleteAccountDialog} onOpenChange={setShowDeleteAccountDialog}>
              <AlertDialogTrigger asChild>
                <button className="text-xs text-destructive hover:text-destructive/80 flex items-center gap-1.5 transition-colors w-full">
                  <UserX className="w-3.5 h-3.5" /> Hapus Akun Saya
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-destructive flex items-center gap-2">
                    <UserX className="w-5 h-5" /> Hapus Akun Permanen
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Tindakan ini <strong>tidak dapat dibatalkan</strong>. Seluruh data akun kamu (profil, RPG, riwayat) akan dihapus selamanya. Apakah kamu yakin?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Batal, Kembali</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={() => handleDeleteAccount(true)}
                  >
                    Hapus Akun Selamanya
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </section>
      )}

      {/* Support & Report */}
      <section className="bg-card border border-border rounded-2xl p-5 space-y-3">
        <h2 className="text-sm font-bold flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-primary" />
          Bantuan & Dukungan
        </h2>
        <p className="text-xs text-muted-foreground">
          Temukan bug? Punya saran? Atau perlu bantuan? Hubungi admin kami langsung!
        </p>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setShowSupport(true)}
            className="flex flex-col items-center gap-2 p-4 rounded-xl border border-red-500/30 bg-red-500/5 hover:bg-red-500/10 transition-all group"
          >
            <Bug className="w-5 h-5 text-red-400 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-semibold text-red-400">Laporkan Bug</span>
          </button>
          <button
            onClick={() => setShowSupport(true)}
            className="flex flex-col items-center gap-2 p-4 rounded-xl border border-primary/30 bg-primary/5 hover:bg-primary/10 transition-all group"
          >
            <MessageSquare className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
            <span className="text-xs font-semibold text-primary">Kirim Pesan</span>
          </button>
        </div>
      </section>

      {/* About */}
      <section className="bg-card border border-border rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <Code2 className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-bold">Tentang Aplikasi</h2>
        </div>
        <div className="space-y-1 text-sm text-muted-foreground">
          <p><span className="text-foreground font-semibold">Renime</span> — Streaming Anime Sub Indo</p>
          <p className="text-xs">Versi 2.0.0</p>
          <p className="text-xs mt-2 pt-2 border-t border-border">Developed by <span className="text-primary font-semibold">Adly</span></p>
        </div>
      </section>

      <AnimatePresence>
        {showAuth && (
          <AuthModal
            onClose={() => setShowAuth(false)}
            onSuccess={(u) => { setUser(u); setShowAuth(false); window.dispatchEvent(new Event("renime-auth-change")); }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showGacha && <GachaModal onClose={() => setShowGacha(false)} />}
      </AnimatePresence>

      <AnimatePresence>
        {showSupport && <SupportModal onClose={() => setShowSupport(false)} />}
      </AnimatePresence>
    </div>
  );
}
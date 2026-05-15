const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState, useEffect, useRef } from "react";

import { firebaseAuth } from "@/lib/firebaseAuth";
import { rpgStorage, RAS_CONFIG, levelFromTotalExp } from "@/lib/rpgSystem";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { orbStorage } from "@/lib/orbSystem";
import {
  Shield, Plus, Trash2, Upload, Smile, RefreshCw, BarChart2,
  Users, MessageCircle, Film, Trophy, Crown, Palette,
  Star, ChevronDown, Zap, TrendingUp, Sparkles, Gem, Ticket,
} from "lucide-react";
import TicketsAdminTab from "@/components/admin/TicketsAdminTab";
import CustomBadgeDisplay from "@/components/profile/CustomBadgeDisplay";
import CustomRolePanel from "@/components/admin/CustomRolePanel";
import AnnouncementManager from "@/components/announcement/AnnouncementManager";
import StaffChatPanel from "@/components/staff/StaffChatPanel";

// ── Analytics helpers ─────────────────────────────────────────────────────────
function getAnalytics() {
  const users = JSON.parse(localStorage.getItem("renime_users") || "[]");
  const totalUsers = users.length;
  const week = Date.now() - 7 * 24 * 3600 * 1000;
  const activeRecently = users.filter((u) => u.lastLogin && new Date(u.lastLogin).getTime() > week).length;
  let totalExp = 0;
  let maxLevel = 0;
  const rasCount = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key?.startsWith("renime_rpg_")) continue;
    try {
      const d = JSON.parse(localStorage.getItem(key));
      totalExp += d.totalExp || 0;
      const { level } = levelFromTotalExp(d.totalExp || 0);
      if (level > maxLevel) maxLevel = level;
      rasCount[d.ras] = (rasCount[d.ras] || 0) + 1;
    } catch {}
  }
  return { totalUsers, activeRecently, totalExp, maxLevel, rasCount };
}

function getTopUsers() {
  const users = JSON.parse(localStorage.getItem("renime_users") || "[]");
  const result = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key?.startsWith("renime_rpg_")) continue;
    try {
      const d = JSON.parse(localStorage.getItem(key));
      const u = users.find((x) => x.id === d.userId);
      if (!u) continue;
      const { level } = levelFromTotalExp(d.totalExp || 0);
      result.push({ ...u, ras: d.ras, level, totalExp: d.totalExp || 0 });
    } catch {}
  }
  return result.sort((a, b) => b.totalExp - a.totalExp);
}

// ── Custom Badge/Title storage ────────────────────────────────────────────────
const BADGES_KEY = "renime_custom_badges";
export function getCustomBadge(userId) {
  try {
    const all = JSON.parse(localStorage.getItem(BADGES_KEY) || "{}");
    return all[userId] || null;
  } catch { return null; }
}
function setCustomBadge(userId, badge) {
  try {
    const all = JSON.parse(localStorage.getItem(BADGES_KEY) || "{}");
    all[userId] = badge;
    localStorage.setItem(BADGES_KEY, JSON.stringify(all));
    window.dispatchEvent(new Event("renime-badges-change"));
  } catch {}
}
function removeCustomBadge(userId) {
  try {
    const all = JSON.parse(localStorage.getItem(BADGES_KEY) || "{}");
    delete all[userId];
    localStorage.setItem(BADGES_KEY, JSON.stringify(all));
    window.dispatchEvent(new Event("renime-badges-change"));
  } catch {}
}

// ── Modify user RPG level ─────────────────────────────────────────────────────
function addUserExp(userId, amount) {
  try {
    const key = `renime_rpg_${userId}`;
    const data = JSON.parse(localStorage.getItem(key) || "{}");
    data.userId = userId;
    data.totalExp = (data.totalExp || 0) + amount;
    const { level } = levelFromTotalExp(data.totalExp);
    data.level = level;
    localStorage.setItem(key, JSON.stringify(data));
    window.dispatchEvent(new Event("renime-rpg-change"));
    return data;
  } catch { return null; }
}

// ── Staff Management Component ────────────────────────────────────────────────
function StaffManagement() {
  const [staffEmails, setStaffEmails] = React.useState([]);
  const [newEmail, setNewEmail] = React.useState("");
  const [msg, setMsg] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const flash = (m) => { setMsg(m); setTimeout(() => setMsg(""), 2500); };

  React.useEffect(() => {
    firebaseAuth.getStaffEmails().then(setStaffEmails);
  }, []);

  const handleAdd = async () => {
    const email = newEmail.trim().toLowerCase();
    if (!email) return;
    setLoading(true);
    await firebaseAuth.addStaffEmail(email);
    setStaffEmails(await firebaseAuth.getStaffEmails());
    setNewEmail("");
    flash("Staf ditambahkan!");
    setLoading(false);
  };

  const handleRemove = async (email) => {
    setLoading(true);
    await firebaseAuth.removeStaffEmail(email);
    setStaffEmails(await firebaseAuth.getStaffEmails());
    flash("Staf dihapus.");
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      {msg && <div className="px-4 py-2.5 rounded-xl text-sm font-semibold text-green-400 bg-green-500/10 border border-green-500/20">{msg}</div>}
      <div className="bg-secondary/40 rounded-xl border border-border p-4 space-y-2">
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Hak Akses Staf</p>
        <p className="flex items-center gap-1.5 text-xs text-foreground/80"><span className="text-green-400 font-bold">+</span> Lihat &amp; balas tiket support</p>
        <p className="flex items-center gap-1.5 text-xs text-foreground/80"><span className="text-green-400 font-bold">+</span> Kelola pengumuman</p>
        <p className="flex items-center gap-1.5 text-xs text-foreground/80"><span className="text-green-400 font-bold">+</span> Chat internal admin &amp; staf</p>
        <p className="flex items-center gap-1.5 text-xs text-foreground/80"><span className="text-red-400 font-bold">-</span> Panel Admin penuh (hanya Admin)</p>
      </div>
      <div className="space-y-2">
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Tambah Staf via Email</p>
        <div className="flex gap-2">
          <Input value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="Email user..."
            className="flex-1 bg-secondary border-secondary text-sm" />
          <Button size="sm" onClick={handleAdd} disabled={!newEmail.trim() || loading} className="bg-cyan-500 hover:bg-cyan-400 gap-1 shrink-0">
            <Plus className="w-3 h-3" /> Tambah
          </Button>
        </div>
      </div>
      {staffEmails.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4 bg-secondary/30 rounded-xl border border-dashed border-border">Belum ada staf terdaftar</p>
      ) : (
        <div className="space-y-2">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Staf Aktif ({staffEmails.length})</p>
          {staffEmails.map((email) => (
            <div key={email} className="flex items-center gap-3 p-3 bg-secondary/40 rounded-xl border border-border">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                {email[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{email}</p>
              </div>
              <button onClick={() => handleRemove(email)} className="p-1.5 hover:bg-destructive/15 text-destructive rounded-lg transition-colors shrink-0">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Badge effect presets
const BADGE_EFFECTS = [
  { id: "none",     label: "Biasa",      desc: "Tanpa efek" },
  { id: "glow",     label: "✨ Glow",    desc: "Cahaya berpendar" },
  { id: "rainbow",  label: "🌈 Pelangi", desc: "Warna berganti" },
  { id: "fire",     label: "🔥 Api",     desc: "Api menyala" },
  { id: "sparkle",  label: "⭐ Kerlip",  desc: "Berkelap-kelip" },
  { id: "neon",     label: "💜 Neon",    desc: "Neon glowing" },
  { id: "ice",      label: "❄️ Es",      desc: "Beku berkilau" },
  { id: "gold",     label: "👑 Emas",    desc: "Shiny gold" },
  { id: "matrix",   label: "🟩 Matrix",  desc: "Digital green" },
  { id: "galaxy",   label: "🌌 Galaxy",  desc: "Warna galaksi" },
  { id: "blood",    label: "🩸 Darah",   desc: "Merah membara" },
  { id: "electric", label: "⚡ Listrik", desc: "Efek petir" },
];

function BadgeEffectPreview({ title, emoji, color, effect }) {
  return <CustomBadgeDisplay badge={{ title, emoji, color, effect }} size="sm" />;
}

// ── Admin Management Component ────────────────────────────────────────────────
function AdminManagement({ currentUserEmail }) {
  const [adminEmails, setAdminEmails] = React.useState([]);
  const [newEmail, setNewEmail] = React.useState("");
  const [msg, setMsg] = React.useState({ text: "", type: "success" });
  const [loading, setLoading] = React.useState(false);

  const flash = (text, type = "success") => { setMsg({ text, type }); setTimeout(() => setMsg({ text: "", type: "success" }), 2500); };

  React.useEffect(() => {
    firebaseAuth.getAdminEmails().then(setAdminEmails);
  }, []);

  const handleAdd = async () => {
    const email = newEmail.trim().toLowerCase();
    if (!email) return;
    setLoading(true);
    await firebaseAuth.addAdminEmail(email);
    setAdminEmails(await firebaseAuth.getAdminEmails());
    setNewEmail("");
    flash("Admin ditambahkan!");
    setLoading(false);
  };

  const handleRemove = async (email) => {
    if (email.toLowerCase() === currentUserEmail?.toLowerCase()) {
      flash("Tidak bisa menghapus diri sendiri sebagai Admin.", "error");
      return;
    }
    setLoading(true);
    await firebaseAuth.removeAdminEmail(email);
    setAdminEmails(await firebaseAuth.getAdminEmails());
    flash("Admin dihapus.");
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      {msg.text && (
        <div className={`px-4 py-2.5 rounded-xl text-sm font-semibold border ${msg.type === "error" ? "text-red-400 bg-red-500/10 border-red-500/20" : "text-green-400 bg-green-500/10 border-green-500/20"}`}>
          {msg.text}
        </div>
      )}
      <div className="bg-secondary/40 rounded-xl border border-border p-4 space-y-2">
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Hak Akses Admin (Dewa)</p>
        <p className="flex items-center gap-1.5 text-xs text-foreground/80"><span className="text-green-400 font-bold">+</span> Akses semua panel & fitur</p>
        <p className="flex items-center gap-1.5 text-xs text-foreground/80"><span className="text-green-400 font-bold">+</span> Kelola staf, role, emoji, tiket</p>
        <p className="flex items-center gap-1.5 text-xs text-foreground/80"><span className="text-green-400 font-bold">+</span> Tambah/hapus Admin lain</p>
        <p className="flex items-center gap-1.5 text-xs text-foreground/80"><span className="text-yellow-400 font-bold">!</span> Badge tampil "👑 Dewa" di semua tempat</p>
      </div>
      <div className="space-y-2">
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Tambah Admin via Email</p>
        <div className="flex gap-2">
          <Input value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="Email user..."
            className="flex-1 bg-secondary border-secondary text-sm" />
          <Button size="sm" onClick={handleAdd} disabled={!newEmail.trim() || loading} className="bg-red-500 hover:bg-red-400 gap-1 shrink-0">
            <Plus className="w-3 h-3" /> Tambah
          </Button>
        </div>
      </div>
      {adminEmails.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4 bg-secondary/30 rounded-xl border border-dashed border-border">Belum ada admin</p>
      ) : (
        <div className="space-y-2">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Admin Aktif ({adminEmails.length})</p>
          {adminEmails.map((email) => {
            const isSelf = email.toLowerCase() === currentUserEmail?.toLowerCase();
            return (
              <div key={email} className="flex items-center gap-3 p-3 bg-secondary/40 rounded-xl border border-border">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {email[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-semibold truncate">{email}</p>
                    {isSelf && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-primary/15 text-primary font-bold border border-primary/30">Kamu</span>}
                  </div>
                </div>
                {!isSelf && (
                  <button onClick={() => handleRemove(email)} disabled={loading} className="p-1.5 hover:bg-destructive/15 text-destructive rounded-lg transition-colors shrink-0">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const TABS = [
  { id: "analytics", label: "Analitik",  icon: BarChart2 },
  { id: "users",     label: "Pengguna",  icon: Users },
  { id: "roles",     label: "Role",      icon: Crown },
  { id: "admins",    label: "Admin",     icon: Shield },
  { id: "staff",     label: "Staf",      icon: Users },
  { id: "tickets",   label: "Tiket",     icon: Ticket },
  { id: "announce",  label: "Umumkan",   icon: Sparkles },
  { id: "chat",      label: "Chat Tim",  icon: MessageCircle },
  { id: "emoji",     label: "Emoji",     icon: Smile },
];

export default function AdminPanel() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("analytics");
  const [emojis, setEmojis] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [emojiName, setEmojiName] = useState("");
  const [category, setCategory] = useState("");
  const [previewSrc, setPreviewSrc] = useState(null);
  const [isAnimated, setIsAnimated] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [analytics, setAnalytics] = useState(() => getAnalytics());
  const [topUsers, setTopUsers] = useState(() => getTopUsers());
  const [expandBadge, setExpandBadge] = useState(null);
  const [badgeTitle, setBadgeTitle] = useState("");
  const [badgeColor, setBadgeColor] = useState("#a855f7");
  const [badgeEmoji, setBadgeEmoji] = useState("⭐");
  const [badgeEffect, setBadgeEffect] = useState("none");
  const [expAmount, setExpAmount] = useState(100);
  const fileRef = useRef(null);
  const selectedFile = useRef(null);
  const [emojiCompressing, setEmojiCompressing] = useState(false);

  useEffect(() => {
    firebaseAuth.getUser().then(u => {
      setUser(u);
      if (u?.role === "admin") {
        db.entities.CustomEmoji.list().then(setEmojis);
        setAnalytics(getAnalytics());
        setTopUsers(getTopUsers());
      }
    });
    const handler = () => firebaseAuth.getUser().then(setUser);
    window.addEventListener("renime-auth-change", handler);
    return () => window.removeEventListener("renime-auth-change", handler);
  }, []);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (user.role !== "admin") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Shield className="w-12 h-12 text-muted-foreground" />
        <p className="text-muted-foreground">Akses hanya untuk Admin</p>
      </div>
    );
  }

  const compressImage = (dataUrl, maxBytes = 200 * 1024) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        let w = img.naturalWidth, h = img.naturalHeight;
        const MAX_DIM = 64;
        if (w > MAX_DIM || h > MAX_DIM) {
          const ratio = Math.min(MAX_DIM / w, MAX_DIM / h);
          w = Math.round(w * ratio); h = Math.round(h * ratio);
        }
        const canvas = document.createElement("canvas");
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, w, h);
        let quality = 0.9;
        const tryCompress = () => {
          const result = canvas.toDataURL("image/webp", quality);
          if (result.length * 0.75 <= maxBytes || quality <= 0.3) { resolve(result); return; }
          quality -= 0.1;
          tryCompress();
        };
        tryCompress();
      };
      img.src = dataUrl;
    });
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { setError("Hanya file gambar/GIF"); return; }
    setError("");
    setIsAnimated(file.type === "image/gif");
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const src = ev.target.result;
      if (file.type === "image/gif") {
        selectedFile.current = file;
        setPreviewSrc(src);
        if (file.size > 1.5 * 1024 * 1024) {
          setEmojiCompressing(false);
          setError("GIF melebihi 1.5MB, mungkin gagal upload. Coba GIF yang lebih kecil.");
        }
      } else {
        setEmojiCompressing(true);
        const compressed = await compressImage(src, 200 * 1024);
        setPreviewSrc(compressed);
        const res = await fetch(compressed);
        const blob = await res.blob();
        selectedFile.current = new File([blob], file.name.replace(/\.\w+$/, ".webp"), { type: "image/webp" });
        setEmojiCompressing(false);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleUpload = async () => {
    if (!selectedFile.current) { setError("Pilih file emoji"); return; }
    const cleanName = emojiName.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "");
    if (!cleanName) { setError("Nama emoji wajib diisi"); return; }
    setUploading(true); setError("");
    const { file_url } = await db.integrations.Core.UploadFile({ file: selectedFile.current });
    await db.entities.CustomEmoji.create({ name: cleanName, url: file_url, category: category.trim() || "umum", is_animated: isAnimated });
    setSuccess(`Emoji :${cleanName}: ditambahkan!`);
    setTimeout(() => setSuccess(""), 3000);
    setEmojiName(""); setCategory(""); setPreviewSrc(null); selectedFile.current = null; setEmojiCompressing(false);
    setUploading(false);
    db.entities.CustomEmoji.list().then(setEmojis);
  };

  const handleDeleteEmoji = async (id) => {
    await db.entities.CustomEmoji.delete(id);
    setEmojis((p) => p.filter((e) => e.id !== id));
  };

  const handleGiveBadge = (userId) => {
    if (!badgeTitle.trim()) return;
    setCustomBadge(userId, { title: badgeTitle.trim(), color: badgeColor, emoji: badgeEmoji, effect: badgeEffect });
    setSuccess("Badge diberikan!");
    setTimeout(() => setSuccess(""), 2000);
    setExpandBadge(null); setBadgeTitle(""); setBadgeEmoji("⭐"); setBadgeColor("#a855f7"); setBadgeEffect("none");
    setTopUsers(getTopUsers());
  };

  const handleAddExp = (userId, amount) => {
    const result = addUserExp(userId, amount);
    if (result) {
      setSuccess(`+${amount} EXP diberikan! Level sekarang: ${result.level}`);
      setTimeout(() => setSuccess(""), 3000);
      setTopUsers(getTopUsers());
    }
  };

  const handleAddOrb = (userId, amount) => {
    orbStorage.add(userId, amount);
    setSuccess(`+${amount} Orb diberikan!`);
    setTimeout(() => setSuccess(""), 2000);
  };

  const handleRemoveBadge = (userId) => {
    removeCustomBadge(userId);
    setTopUsers(getTopUsers());
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
          <Shield className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="font-heading font-extrabold text-xl">Panel Admin</h1>
          <p className="text-xs text-muted-foreground">Selamat datang, {user.name}</p>
        </div>
        <div className="ml-auto text-right">
          <p className="text-xs text-muted-foreground">Total User</p>
          <p className="text-2xl font-extrabold text-primary">{analytics.totalUsers}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-secondary rounded-xl p-1 gap-1 overflow-x-auto scrollbar-hide">
        {TABS.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap min-w-max ${
                activeTab === t.id ? "bg-card text-foreground shadow" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" /> {t.label}
            </button>
          );
        })}
      </div>

      {success && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="px-4 py-2.5 rounded-xl text-sm font-semibold text-green-400 bg-green-500/10 border border-green-500/20">
          ✅ {success}
        </motion.div>
      )}

      {/* Analytics Tab */}
      {activeTab === "analytics" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Total User", value: analytics.totalUsers, icon: Users, color: "text-blue-400", bg: "bg-blue-500/10" },
              { label: "Aktif 7 Hari", value: analytics.activeRecently, icon: Film, color: "text-green-400", bg: "bg-green-500/10" },
              { label: "Level Tertinggi", value: analytics.maxLevel, icon: Trophy, color: "text-yellow-400", bg: "bg-yellow-500/10" },
              { label: "Total EXP", value: analytics.totalExp.toLocaleString(), icon: Star, color: "text-purple-400", bg: "bg-purple-500/10" },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.label} className={`${s.bg} border border-border rounded-xl p-4 flex flex-col items-center gap-1 text-center`}>
                  <Icon className={`w-5 h-5 ${s.color}`} />
                  <p className="text-xl font-extrabold">{s.value}</p>
                  <p className="text-[10px] text-muted-foreground">{s.label}</p>
                </div>
              );
            })}
          </div>
          <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
            <h3 className="font-bold text-sm flex items-center gap-2"><Crown className="w-4 h-4 text-yellow-400" /> Distribusi Ras</h3>
            <div className="space-y-2">
              {Object.entries(analytics.rasCount).sort((a, b) => b[1] - a[1]).map(([ras, count]) => {
                const cfg = RAS_CONFIG[ras] || RAS_CONFIG.manusia;
                const pct = Math.round((count / Math.max(analytics.totalUsers, 1)) * 100);
                return (
                  <div key={ras} className="flex items-center gap-2">
                    <span className="text-sm w-5 text-center">{cfg.emoji}</span>
                    <span className="text-xs w-20 text-muted-foreground">{cfg.label}</span>
                    <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs text-muted-foreground w-8 text-right">{count}x</span>
                  </div>
                );
              })}
              {Object.keys(analytics.rasCount).length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">Belum ada data ras</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === "users" && (
        <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold flex items-center gap-2 text-base">
              <Users className="w-4 h-4 text-primary" />
              Manajemen Pengguna ({topUsers.length})
            </h2>
            <Button variant="ghost" size="sm" onClick={() => setTopUsers(getTopUsers())} className="gap-1.5">
              <RefreshCw className="w-3.5 h-3.5" />
            </Button>
          </div>

          {topUsers.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Belum ada pengguna terdaftar</p>
          ) : (
            <div className="space-y-2">
              {topUsers.map((u, i) => {
                const rasCfg = RAS_CONFIG[u.ras] || RAS_CONFIG.manusia;
                const customBadge = getCustomBadge(u.id);
                const isExpanded = expandBadge === u.id;
                return (
                  <div key={u.id} className="rounded-xl border border-border bg-secondary/40 overflow-hidden">
                    <div className="flex items-center gap-3 p-3">
                      <span className="text-xs font-extrabold text-muted-foreground w-5 text-center">{i + 1}</span>
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-xs font-bold shrink-0 overflow-hidden">
                        {u.avatar ? <img src={u.avatar} alt={u.name} className="w-full h-full object-cover" /> : (u.name || "A")[0].toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="text-sm font-semibold truncate">{u.name}</p>
                          {u.role === "admin" && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-400 font-bold border border-red-500/30">ADMIN</span>}
                          {u.role === "staff" && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 font-bold border border-cyan-500/30">STAF</span>}
                          {customBadge && <BadgeEffectPreview title={customBadge.title} emoji={customBadge.emoji} color={customBadge.color} effect={customBadge.effect || "none"} />}
                        </div>
                        <p className="text-[10px] text-muted-foreground">{rasCfg.emoji} {rasCfg.label} · Lv.{u.level} · {u.totalExp} EXP</p>
                      </div>
                      <button
                        onClick={() => { setExpandBadge(isExpanded ? null : u.id); setBadgeTitle(customBadge?.title || ""); setBadgeColor(customBadge?.color || "#a855f7"); setBadgeEmoji(customBadge?.emoji || "⭐"); }}
                        className="p-1.5 hover:bg-secondary rounded-lg transition-colors text-muted-foreground hover:text-primary"
                        title="Kelola Badge"
                      >
                        <Palette className="w-4 h-4" />
                      </button>
                    </div>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="border-t border-border p-3 space-y-4 bg-card/50">
                            <div>
                              <p className="text-xs font-bold text-foreground flex items-center gap-1.5 mb-2">
                                <Zap className="w-3.5 h-3.5 text-primary" /> Tambah EXP
                              </p>
                              <div className="flex gap-2 flex-wrap">
                                {[100, 500, 1000, 5000].map((amt) => (
                                  <Button key={amt} size="sm" variant="outline" onClick={() => handleAddExp(u.id, amt)}
                                    className="text-xs gap-1 hover:bg-primary/10 hover:border-primary/40 hover:text-primary">
                                    <TrendingUp className="w-3 h-3" /> +{amt}
                                  </Button>
                                ))}
                                <div className="flex items-center gap-1.5">
                                  <Input type="number" value={expAmount} onChange={(e) => setExpAmount(parseInt(e.target.value) || 0)}
                                    className="w-20 h-8 text-xs bg-secondary border-secondary" min={1} />
                                  <Button size="sm" onClick={() => handleAddExp(u.id, expAmount)} disabled={expAmount <= 0}
                                    className="text-xs bg-primary gap-1">
                                    <Plus className="w-3 h-3" /> EXP
                                  </Button>
                                </div>
                              </div>
                            </div>

                            <div>
                              <p className="text-xs font-bold text-foreground flex items-center gap-1.5 mb-2">
                                <Gem className="w-3.5 h-3.5 text-accent" /> Tambah Orb (Gacha)
                              </p>
                              <div className="flex gap-2 flex-wrap">
                                {[5, 10, 20, 50].map((amt) => (
                                  <Button key={amt} size="sm" variant="outline" onClick={() => handleAddOrb(u.id, amt)}
                                    className="text-xs gap-1 hover:bg-accent/10 hover:border-accent/40 hover:text-accent">
                                    <Gem className="w-3 h-3" /> +{amt}
                                  </Button>
                                ))}
                              </div>
                            </div>

                            <div>
                              <p className="text-xs font-bold text-foreground flex items-center gap-1.5 mb-2">
                                <Star className="w-3.5 h-3.5 text-yellow-400" /> Badge Kustom
                              </p>
                              <div className="flex gap-2 mb-2">
                                <Input value={badgeEmoji} onChange={(e) => setBadgeEmoji(e.target.value)} placeholder="Emoji" className="w-16 bg-secondary border-secondary text-center text-lg" />
                                <Input value={badgeTitle} onChange={(e) => setBadgeTitle(e.target.value)} placeholder="Nama badge (contoh: Veteran)" className="flex-1 bg-secondary border-secondary text-sm" />
                                <input type="color" value={badgeColor} onChange={(e) => setBadgeColor(e.target.value)} className="w-10 h-9 rounded-lg border border-border cursor-pointer bg-secondary" title="Warna badge" />
                              </div>
                              <div className="mb-2">
                                <p className="text-[10px] text-muted-foreground mb-1.5 flex items-center gap-1"><Sparkles className="w-3 h-3" /> Efek Badge</p>
                                <div className="grid grid-cols-3 gap-1.5">
                                  {BADGE_EFFECTS.map((ef) => (
                                    <button key={ef.id} onClick={() => setBadgeEffect(ef.id)}
                                      className={`px-2 py-1.5 rounded-lg text-[10px] font-semibold border transition-all text-left ${
                                        badgeEffect === ef.id
                                          ? "bg-primary/15 border-primary/50 text-primary"
                                          : "bg-secondary border-border text-muted-foreground hover:border-primary/30"
                                      }`}>
                                      <div className="font-bold">{ef.label}</div>
                                      <div className="text-[9px] opacity-70">{ef.desc}</div>
                                    </button>
                                  ))}
                                </div>
                              </div>
                              {badgeTitle && (
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="text-xs text-muted-foreground">Preview:</span>
                                  <BadgeEffectPreview title={badgeTitle} emoji={badgeEmoji} color={badgeColor} effect={badgeEffect} />
                                </div>
                              )}
                              <div className="flex gap-2">
                                <Button size="sm" onClick={() => handleGiveBadge(u.id)} disabled={!badgeTitle.trim()} className="gap-1 bg-primary text-xs">
                                  <Plus className="w-3 h-3" /> Simpan Badge
                                </Button>
                                {customBadge && (
                                  <Button size="sm" variant="destructive" onClick={() => handleRemoveBadge(u.id)} className="gap-1 text-xs">
                                    <Trash2 className="w-3 h-3" /> Hapus Badge
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Roles Tab */}
      {activeTab === "roles" && (
        <div className="bg-card border border-border rounded-2xl p-4 sm:p-5 space-y-4">
          <h2 className="font-bold flex items-center gap-2 text-base">
            <Crown className="w-4 h-4 text-yellow-400" /> Manajemen Role
          </h2>
          <CustomRolePanel />
        </div>
      )}

      {/* Admins Tab */}
      {activeTab === "admins" && (
        <div className="bg-card border border-border rounded-2xl p-4 sm:p-5 space-y-4">
          <h2 className="font-bold flex items-center gap-2 text-base">
            <Shield className="w-4 h-4 text-red-400" /> Manajemen Admin (Dewa)
          </h2>
          <AdminManagement currentUserEmail={user?.email} />
        </div>
      )}

      {/* Staff Tab */}
      {activeTab === "staff" && (
        <div className="bg-card border border-border rounded-2xl p-4 sm:p-5 space-y-4">
          <h2 className="font-bold flex items-center gap-2 text-base">
            <Users className="w-4 h-4 text-cyan-400" /> Manajemen Staf
          </h2>
          <StaffManagement />
        </div>
      )}

      {/* Tickets Tab */}
      {activeTab === "tickets" && <TicketsAdminTab />}

      {/* Announce Tab */}
      {activeTab === "announce" && (
        <div className="bg-card border border-border rounded-2xl p-4 sm:p-5">
          <AnnouncementManager isAdmin={true} />
        </div>
      )}

      {/* Chat Tab */}
      {activeTab === "chat" && (
        <div className="bg-card border border-border rounded-2xl p-4 sm:p-5">
          <h2 className="font-bold flex items-center gap-2 text-base mb-4">
            <MessageCircle className="w-4 h-4 text-cyan-400" /> Chat Admin &amp; Staf
          </h2>
          <StaffChatPanel />
        </div>
      )}

      {/* Emoji Tab */}
      {activeTab === "emoji" && (
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
            <h2 className="font-bold flex items-center gap-2 text-base">
              <Smile className="w-4 h-4 text-primary" /> Tambah Emoji Kustom
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input placeholder="Nama emoji (mis: anime_cool)" value={emojiName}
                onChange={(e) => setEmojiName(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""))}
                className="bg-secondary border-secondary" />
              <Input placeholder="Kategori (opsional)" value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="bg-secondary border-secondary" />
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <button onClick={() => fileRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-secondary hover:bg-secondary/80 text-sm font-medium transition-colors border border-border">
                <Upload className="w-4 h-4" /> Pilih Gambar / GIF
              </button>
              <input ref={fileRef} type="file" accept="image/*,.gif" onChange={handleFileSelect} className="hidden" />
              {emojiCompressing && (
                <span className="text-xs text-primary flex items-center gap-1">
                  <div className="w-3 h-3 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /> Mengompres...
                </span>
              )}
              {previewSrc && !emojiCompressing && (
                <div className="flex items-center gap-2">
                  <img src={previewSrc} alt="preview" className="w-10 h-10 object-contain rounded-lg border border-border" />
                  {isAnimated
                    ? <span className="text-xs bg-primary/15 text-primary px-2 py-0.5 rounded-full font-bold">GIF</span>
                    : <span className="text-xs bg-green-500/15 text-green-400 px-2 py-0.5 rounded-full font-bold">Dikompres ✓</span>
                  }
                </div>
              )}
            </div>
            {error && <p className="text-xs text-destructive bg-destructive/10 rounded-lg px-3 py-2">{error}</p>}
            <Button onClick={handleUpload} disabled={uploading || !previewSrc} className="gap-2 bg-gradient-to-r from-primary to-accent text-white font-bold">
              {uploading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Plus className="w-4 h-4" />}
              Tambah Emoji
            </Button>
          </div>

          <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-base">Emoji Kustom ({emojis.length})</h2>
              <Button variant="ghost" size="sm" onClick={() => db.entities.CustomEmoji.list().then(setEmojis)} className="gap-1.5">
                <RefreshCw className="w-3.5 h-3.5" />
              </Button>
            </div>
            {emojis.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">Belum ada emoji kustom</p>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 gap-3">
                <AnimatePresence>
                  {emojis.map((em) => (
                    <motion.div key={em.id} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                      className="group relative flex flex-col items-center gap-1.5 p-2 bg-secondary rounded-xl border border-border hover:border-primary/40 transition-all">
                      <img src={em.url} alt={em.name} className="w-12 h-12 object-contain rounded-lg" />
                      <span className="text-[10px] text-muted-foreground text-center truncate w-full">{em.name}</span>
                      {em.is_animated && <span className="absolute top-1 right-1 text-[8px] bg-primary/80 text-white px-1 rounded-full font-bold">GIF</span>}
                      <button onClick={() => handleDeleteEmoji(em.id)}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-destructive text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center shadow-lg">
                        <Trash2 className="w-2.5 h-2.5" />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
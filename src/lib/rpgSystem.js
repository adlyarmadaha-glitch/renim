// ── RPG System — Level, EXP, Ras/Title ─────────────────────────────────────
const RPG_KEY = "renime_rpg";

// ── Ras Config ──────────────────────────────────────────────────────────────
export const RAS_CONFIG = {
  manusia: {
    label: "Manusia",
    emoji: "🧑",
    rarity: "common",
    // 50% chance
    weight: 50,
    color: "text-slate-300",
    bg: "bg-slate-500/15",
    border: "border-slate-500/30",
    glow: "",
    desc: "Jiwa yang penuh tekad dan ambisi tanpa batas",
  },
  elf: {
    label: "Elf",
    emoji: "🧝",
    rarity: "uncommon",
    weight: 20,
    color: "text-emerald-400",
    bg: "bg-emerald-500/15",
    border: "border-emerald-500/30",
    glow: "shadow-emerald-500/20",
    desc: "Makhluk anggun dengan umur panjang dan telinga lancip",
  },
  dwarf: {
    label: "Dwarf",
    emoji: "⛏️",
    rarity: "uncommon",
    weight: 12,
    color: "text-amber-500",
    bg: "bg-amber-500/15",
    border: "border-amber-500/30",
    glow: "shadow-amber-500/20",
    desc: "Pandai besi tangguh dari bawah tanah yang kuat",
  },
  goblin: {
    label: "Goblin",
    emoji: "👺",
    rarity: "rare",
    weight: 8,
    color: "text-lime-400",
    bg: "bg-lime-500/15",
    border: "border-lime-500/30",
    glow: "shadow-lime-500/20",
    desc: "Licik, lincah, dan penuh kejutan di setiap langkah",
  },
  beastman: {
    label: "Beastman",
    emoji: "🐺",
    rarity: "rare",
    weight: 5,
    color: "text-orange-400",
    bg: "bg-orange-500/15",
    border: "border-orange-500/30",
    glow: "shadow-orange-500/20",
    desc: "Setengah manusia setengah binatang buas yang ganas",
  },
  demon: {
    label: "Iblis",
    emoji: "😈",
    rarity: "epic",
    weight: 3,
    color: "text-red-400",
    bg: "bg-red-500/15",
    border: "border-red-500/30",
    glow: "shadow-red-500/30",
    desc: "Makhluk dari neraka dengan kekuatan gelap yang mengerikan",
  },
  angel: {
    label: "Malaikat",
    emoji: "👼",
    rarity: "epic",
    weight: 1.5,
    color: "text-sky-300",
    bg: "bg-sky-500/15",
    border: "border-sky-500/30",
    glow: "shadow-sky-400/30",
    desc: "Makhluk suci bersayap yang menjaga keseimbangan dunia",
  },
  raja_iblis: {
    label: "Raja Iblis",
    emoji: "👿",
    rarity: "legendary",
    weight: 0.25,
    color: "text-red-300",
    bg: "bg-red-900/30",
    border: "border-red-400/50",
    glow: "shadow-red-500/50",
    desc: "Penguasa kegelapan — takdir membawamu ke puncak kejahatan",
    animated: true,
  },
  pahlawan: {
    label: "Pahlawan",
    emoji: "⚔️",
    rarity: "legendary",
    weight: 0.25,
    color: "text-yellow-300",
    bg: "bg-yellow-500/15",
    border: "border-yellow-400/50",
    glow: "shadow-yellow-400/50",
    desc: "Satu dari sejuta — dipilih takdir untuk menyelamatkan dunia",
    animated: true,
  },
};

export const RARITY_LABEL = {
  common: { label: "Common", color: "text-slate-400" },
  uncommon: { label: "Uncommon", color: "text-emerald-400" },
  rare: { label: "Rare", color: "text-blue-400" },
  epic: { label: "Epic", color: "text-purple-400" },
  legendary: { label: "Legendary", color: "text-yellow-400" },
};

// ── Gacha: assign ras saat register ─────────────────────────────────────────
export function rollRas() {
  const entries = Object.entries(RAS_CONFIG);
  const total = entries.reduce((s, [, v]) => s + v.weight, 0);
  let rand = Math.random() * total;
  for (const [key, cfg] of entries) {
    rand -= cfg.weight;
    if (rand <= 0) return key;
  }
  return "manusia";
}

// ── EXP / Level Config ───────────────────────────────────────────────────────
// Random EXP with balanced range
export const EXP_PER_EPISODE = 80;   // base (actual is randomized ±30%)
export const EXP_PER_CHAPTER = 30;   // base (actual is randomized ±30%)

// Returns a random EXP value balanced around a base
export function randomExp(base) {
  // Range: base * 0.7 → base * 1.3
  const roll1 = Math.random();
  const roll2 = Math.random();
  const avg = (roll1 + roll2) / 2;
  const factor = 0.7 + avg * 0.6; // 0.7 → 1.3
  return Math.round(base * factor);
}

export function expToNextLevel(level) {
  // Gentle scaling: lv1=100, lv5=300, lv10=700, lv20=2000, lv50=8000
  // Formula: 100 * (1.15^(level-1)) — much more achievable
  return Math.floor(100 * Math.pow(1.15, level - 1));
}

// ── Completed Content Tracker ────────────────────────────────────────────────
const DONE_KEY = "renime_exp_done";
export const expDoneStorage = {
  has(userId, contentId) {
    try {
      const raw = localStorage.getItem(`${DONE_KEY}_${userId}`);
      const set = raw ? JSON.parse(raw) : [];
      return set.includes(contentId);
    } catch { return false; }
  },
  mark(userId, contentId) {
    try {
      const raw = localStorage.getItem(`${DONE_KEY}_${userId}`);
      const set = raw ? JSON.parse(raw) : [];
      if (!set.includes(contentId)) {
        set.push(contentId);
        // Keep max 500 entries
        if (set.length > 500) set.splice(0, set.length - 500);
        localStorage.setItem(`${DONE_KEY}_${userId}`, JSON.stringify(set));
      }
    } catch {}
  },
};

export function levelFromTotalExp(totalExp) {
  let level = 1;
  let remaining = totalExp;
  while (remaining >= expToNextLevel(level)) {
    remaining -= expToNextLevel(level);
    level++;
    if (level > 999) break;
  }
  return { level, currentExp: remaining, nextLevelExp: expToNextLevel(level) };
}

// ── Storage API ───────────────────────────────────────────────────────────────
export const rpgStorage = {
  get(userId) {
    try {
      const raw = localStorage.getItem(`${RPG_KEY}_${userId}`);
      if (!raw) return null;
      const data = JSON.parse(raw);
      // Always recompute level from totalExp for consistency
      const { level, currentExp, nextLevelExp } = levelFromTotalExp(data.totalExp || 0);
      return { ...data, level, currentExp, nextLevelExp };
    } catch { return null; }
  },

  init(userId, ras) {
    const existing = this.get(userId);
    if (existing) return existing;
    const data = { userId, ras, totalExp: 0, createdAt: new Date().toISOString() };
    this._save(userId, data);
    return data;
  },

  addExp(userId, amount, reason = "") {
    const raw = (() => { try { const r = localStorage.getItem(`${RPG_KEY}_${userId}`); return r ? JSON.parse(r) : null; } catch { return null; } })();
    const data = raw || { userId, ras: "manusia", totalExp: 0 };
    const before = levelFromTotalExp(data.totalExp || 0);
    data.totalExp = (data.totalExp || 0) + amount;
    const after = levelFromTotalExp(data.totalExp);
    data.level = after.level;
    this._save(userId, data);
    const leveledUp = after.level > before.level;
    return { data, leveledUp, newLevel: after.level, expGained: amount, reason };
  },

  _save(userId, data) {
    try {
      localStorage.setItem(`${RPG_KEY}_${userId}`, JSON.stringify(data));
    } catch {}
    window.dispatchEvent(new CustomEvent("renime-rpg-change", { detail: { userId } }));
  },
};
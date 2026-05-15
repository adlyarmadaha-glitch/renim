// ── ORB System — Mata Uang Gacha ─────────────────────────────────────────────
const ORB_KEY = "renime_orbs";
const ORB_PER_CONTENT = 1;    // 1 orb per episode/chapter
export const GACHA_COST = 20; // 20 orb untuk 1x gacha

export const orbStorage = {
  get(userId) {
    try {
      const raw = localStorage.getItem(`${ORB_KEY}_${userId}`);
      return raw ? parseInt(raw) : 0;
    } catch { return 0; }
  },

  add(userId, amount) {
    const current = this.get(userId);
    const next = current + amount;
    try {
      localStorage.setItem(`${ORB_KEY}_${userId}`, String(next));
    } catch {}
    window.dispatchEvent(new CustomEvent("renime-orb-change", { detail: { userId, orbs: next } }));
    return next;
  },

  spend(userId, amount) {
    const current = this.get(userId);
    if (current < amount) return false;
    const next = current - amount;
    try {
      localStorage.setItem(`${ORB_KEY}_${userId}`, String(next));
    } catch {}
    window.dispatchEvent(new CustomEvent("renime-orb-change", { detail: { userId, orbs: next } }));
    return true;
  },
};

export { ORB_PER_CONTENT };
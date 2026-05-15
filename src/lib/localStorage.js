// Local storage helpers — replacement for base44 entities
// Bookmarks
const BOOKMARK_KEY = "renime_bookmarks";
const COMMENT_KEY = "renime_comments";
const HISTORY_KEY = "renime_history";

function genId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export const bookmarkStorage = {
  list() {
    try {
      const raw = localStorage.getItem(BOOKMARK_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  },
  add(item) {
    const list = this.list();
    const existing = list.find((b) => b.anime_id === item.anime_id);
    if (existing) return existing;
    const record = { ...item, id: genId(), created_date: new Date().toISOString() };
    list.unshift(record);
    localStorage.setItem(BOOKMARK_KEY, JSON.stringify(list));
    return record;
  },
  remove(animeId) {
    const list = this.list().filter((b) => b.anime_id !== animeId);
    localStorage.setItem(BOOKMARK_KEY, JSON.stringify(list));
  },
  isBookmarked(animeId) {
    return this.list().some((b) => b.anime_id === animeId);
  },
};

export const historyStorage = {
  list() {
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  },
  add(item) {
    let list = this.list().filter((h) => h.episode_id !== item.episode_id);
    const record = { ...item, id: genId(), watched_at: new Date().toISOString() };
    list.unshift(record);
    if (list.length > 50) list = list.slice(0, 50);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(list));
    return record;
  },
  remove(episodeId) {
    const list = this.list().filter((h) => h.episode_id !== episodeId);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(list));
  },
  clear() {
    localStorage.removeItem(HISTORY_KEY);
  },
};

// NEW badge tracker — stores seen episode/chapter ids
const SEEN_NEW_KEY = "renime_seen_new";
export const seenNewStorage = {
  list() {
    try { return JSON.parse(localStorage.getItem(SEEN_NEW_KEY) || "[]"); } catch { return []; }
  },
  markSeen(id) {
    const list = this.list();
    if (!list.includes(id)) {
      list.push(id);
      localStorage.setItem(SEEN_NEW_KEY, JSON.stringify(list));
    }
  },
  isSeen(id) {
    return this.list().includes(id);
  },
};

// commentStorage is deprecated — comments now live in base44 shared database.
// This stub is kept for backward compatibility only.
export const commentStorage = {
  list() { return []; },
  add() { return {}; },
  delete() {},
  // Purge all old local comment keys to free up quota
  purgeLocal() {
    const toRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(COMMENT_KEY)) toRemove.push(k);
    }
    toRemove.forEach((k) => localStorage.removeItem(k));
  },
};

// Schedule Reminders — anime yang ingin diingatkan saat episode baru rilis
const REMINDER_KEY = "renime_reminders";
const RELEASED_NOTIF_KEY = "renime_released_notifs";

export const reminderStorage = {
  list() {
    try { return JSON.parse(localStorage.getItem(REMINDER_KEY) || "[]"); } catch { return []; }
  },
  add(item) {
    const list = this.list();
    if (list.some((r) => r.animeId === item.animeId)) return;
    list.push({ ...item, addedAt: new Date().toISOString() });
    localStorage.setItem(REMINDER_KEY, JSON.stringify(list));
  },
  remove(animeId) {
    const list = this.list().filter((r) => r.animeId !== animeId);
    localStorage.setItem(REMINDER_KEY, JSON.stringify(list));
  },
  isReminded(animeId) {
    return this.list().some((r) => r.animeId === animeId);
  },
  // Called when episode baru terdeteksi
  markReleased(animeId, episodeTitle) {
    const notifs = this.getReleasedNotifs();
    if (!notifs.find((n) => n.animeId === animeId && n.episodeTitle === episodeTitle)) {
      notifs.unshift({ animeId, episodeTitle, releasedAt: new Date().toISOString(), seen: false });
      localStorage.setItem(RELEASED_NOTIF_KEY, JSON.stringify(notifs.slice(0, 50)));
    }
  },
  getReleasedNotifs() {
    try { return JSON.parse(localStorage.getItem(RELEASED_NOTIF_KEY) || "[]"); } catch { return []; }
  },
  markNotifSeen(animeId) {
    const notifs = this.getReleasedNotifs().map((n) => n.animeId === animeId ? { ...n, seen: true } : n);
    localStorage.setItem(RELEASED_NOTIF_KEY, JSON.stringify(notifs));
  },
  clearReleasedNotifs() {
    localStorage.removeItem(RELEASED_NOTIF_KEY);
  },
  unseenCount() {
    return this.getReleasedNotifs().filter((n) => !n.seen).length;
  },
};

// Run purge once to free up space from old localStorage comments
commentStorage.purgeLocal();
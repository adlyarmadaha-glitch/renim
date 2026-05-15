// Bookmark Notification System
// Cek apakah anime yang di-bookmark punya episode baru

const NOTIF_KEY = "renime_bookmark_notifs";
const NOTIF_SEEN_KEY = "renime_notifs_seen";

export function getNotifications() {
  try { return JSON.parse(localStorage.getItem(NOTIF_KEY) || "[]"); }
  catch { return []; }
}

export function saveNotifications(notifs) {
  localStorage.setItem(NOTIF_KEY, JSON.stringify(notifs));
}

export function getSeenIds() {
  try { return JSON.parse(localStorage.getItem(NOTIF_SEEN_KEY) || "[]"); }
  catch { return []; }
}

export function markAllSeen() {
  const notifs = getNotifications();
  localStorage.setItem(NOTIF_SEEN_KEY, JSON.stringify(notifs.map((n) => n.id)));
}

export function markSeen(id) {
  const seen = getSeenIds();
  if (!seen.includes(id)) {
    seen.push(id);
    localStorage.setItem(NOTIF_SEEN_KEY, JSON.stringify(seen));
  }
}

export function getUnreadCount() {
  const notifs = getNotifications();
  const seen = getSeenIds();
  return notifs.filter((n) => !seen.includes(n.id)).length;
}

// Tambah notifikasi episode baru
export function addEpisodeNotification({ animeId, animeTitle, poster, episodeTitle, episodeId }) {
  const notifs = getNotifications();
  const id = `ep-${animeId}-${episodeId}`;
  // Hindari duplikasi
  if (notifs.find((n) => n.id === id)) return;
  notifs.unshift({
    id,
    type: "new_episode",
    animeId,
    animeTitle,
    poster,
    episodeTitle,
    episodeId,
    createdAt: new Date().toISOString(),
  });
  // Max 50 notifikasi
  if (notifs.length > 50) notifs.splice(50);
  saveNotifications(notifs);
}

// Cek bookmark vs episode terbaru dari API — panggil saat home load
export async function checkBookmarkUpdates(bookmarks, fetchAnimeDetail) {
  const CHECKED_KEY = "renime_notif_checked";
  const now = Date.now();
  // Cek max sekali per 30 menit
  const lastCheck = parseInt(localStorage.getItem(CHECKED_KEY) || "0");
  if (now - lastCheck < 30 * 60 * 1000) return;
  localStorage.setItem(CHECKED_KEY, String(now));

  const LAST_EP_KEY = "renime_last_ep";
  let lastEps = {};
  try { lastEps = JSON.parse(localStorage.getItem(LAST_EP_KEY) || "{}"); } catch {}

  for (const bm of bookmarks.slice(0, 8)) {
    try {
      const detail = await fetchAnimeDetail(bm.anime_id || bm.animeId);
      const episodes = detail?.data?.episodeList || [];
      if (!episodes.length) continue;
      const latest = episodes[0];
      const latestId = latest.episodeId;
      const prev = lastEps[bm.anime_id || bm.animeId];
      if (prev && prev !== latestId) {
        addEpisodeNotification({
          animeId: bm.anime_id || bm.animeId,
          animeTitle: bm.title,
          poster: bm.poster,
          episodeTitle: latest.title || `Episode Terbaru`,
          episodeId: latestId,
        });
      }
      lastEps[bm.anime_id || bm.animeId] = latestId;
    } catch {}
  }
  localStorage.setItem(LAST_EP_KEY, JSON.stringify(lastEps));
}
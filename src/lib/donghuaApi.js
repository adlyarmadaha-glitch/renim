const BASE = "https://www.sankavollerei.com/anime/donghua";

async function fetchApi(path) {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// Normalize episode slug: strip leading slash and trailing slash
function cleanSlug(slug = "") {
  return slug.replace(/^\/+|\/+$/g, "");
}

// Normalize a donghua item from list endpoints
function normalizeItem(item) {
  return {
    animeId: item.slug || "",
    title: item.title || "",
    poster: item.poster || "",
    status: item.status || "",
    type: item.type || "Donghua",
    score: item.rating || item.score || "",
    currentEpisode: item.current_episode || "",
    sub: item.sub || "",
    href: item.href || "",
  };
}

// Normalize episode item from episode list
function normalizeEpisode(ep) {
  return {
    episodeId: cleanSlug(ep.slug || ep.href || ""),
    title: ep.episode || ep.title || "",
    href: ep.href || "",
  };
}

export const donghuaApi = {

  getHome: async (page = 1) => {
    const json = await fetchApi(`/home/${page}`);
    const latestRelease = (json.latest_release || []).map(normalizeItem);
    // Also fetch latest_donghua for series view
    const latest = (json.latest_donghua || []).map(normalizeItem);
    return {
      latestRelease: latestRelease.length > 0 ? latestRelease : latest,
      data: { latestRelease },
    };
  },

  getLatest: async (page = 1) => {
    const json = await fetchApi(`/latest/${page}`);
    const list = (json.latest_donghua || json.latest_release || []).map(normalizeItem);
    return { list, hasMore: list.length >= 20 };
  },

  getOngoing: async (page = 1) => {
    const json = await fetchApi(`/ongoing/${page}`);
    const list = (json.ongoing || json.data || []).map(normalizeItem);
    return { list, hasMore: list.length >= 20 };
  },

  getCompleted: async (page = 1) => {
    const json = await fetchApi(`/completed/${page}`);
    const list = (json.completed || json.data || []).map(normalizeItem);
    return { list, hasMore: list.length >= 20 };
  },

  search: async (query, page = 1) => {
    const json = await fetchApi(`/search/${encodeURIComponent(query)}/${page}`);
    const list = (json.search_results || json.results || json.data || []).map(normalizeItem);
    return { list, data: { animeList: list } };
  },

  getDetail: async (slug) => {
    const json = await fetchApi(`/detail/${slug}`);
    // Episodes list is newest-first from API, reverse for ascending display
    const rawEps = (json.episodes_list || []).map(normalizeEpisode);
    rawEps.reverse();
    const genres = (json.genres || []).map((g) =>
      typeof g === "string" ? g : g.name || ""
    ).filter(Boolean);

    return {
      data: {
        animeId: slug,
        title: json.title || "",
        poster: json.poster || "",
        status: json.status || "",
        type: json.type || "Donghua",
        score: json.rating || "",
        synopsis: json.synopsis || "",
        genres,
        studio: json.studio || "",
        network: json.network || "",
        released: json.released || json.released_on || "",
        duration: json.duration || "",
        totalEpisodes: json.episodes_count || String(rawEps.length),
        season: json.season || "",
        episodeList: rawEps,
      },
    };
  },

  getEpisode: async (episodeSlug) => {
    const json = await fetchApi(`/episode/${episodeSlug}`);
    const streaming = json.streaming || {};
    const servers = streaming.servers || [];
    const mainUrl = streaming.main_url || null;

    // Build quality groups — single "Default" group
    const qualityGroups = {};
    if (servers.length > 0) {
      qualityGroups["Default"] = servers.map((s) => ({
        serverId: s.url || "",
        serverName: s.name || "Server",
        quality: "Default",
      }));
    } else if (mainUrl) {
      qualityGroups["Default"] = [{
        serverId: mainUrl.url || "",
        serverName: mainUrl.name || "Server 1",
        quality: "Default",
      }];
    }

    // Download links
    const dl = json.download_url || {};
    const downloadUrl = dl.download_url_720p || dl.download_url_480p || null;

    // Navigation
    const nav = json.navigation || {};
    const prevEpisode = nav.previous_episode
      ? { episodeId: cleanSlug(nav.previous_episode.slug || nav.previous_episode.href || ""), title: nav.previous_episode.episode || "" }
      : null;
    const nextEpisode = nav.next_episode
      ? { episodeId: cleanSlug(nav.next_episode.slug || nav.next_episode.href || ""), title: nav.next_episode.episode || "" }
      : null;

    // Episode list for sidebar
    const episodeList = (json.episodes_list || []).map(normalizeEpisode).reverse();

    // Anime info
    const details = json.donghua_details || {};

    return {
      data: {
        episodeId: episodeSlug,
        title: json.episode || "",
        animeId: details.slug || nav.all_episodes?.slug || "",
        animeTitle: details.title || "",
        poster: details.poster || "",
        defaultStreamingUrl: mainUrl?.url || servers[0]?.url || "",
        qualityGroups,
        downloadUrl,
        prevEpisode,
        nextEpisode,
        episodeList,
      },
    };
  },

  getGenres: async () => {
    const json = await fetchApi(`/genres`);
    const list = json.genres || json.data || [];
    return {
      data: list.map((g) =>
        typeof g === "string"
          ? { name: g, slug: g.toLowerCase().replace(/\s+/g, "-") }
          : { name: g.name || "", slug: g.slug || "" }
      ),
    };
  },

  getGenreAnime: async (genreSlug, page = 1) => {
    const json = await fetchApi(`/genres/${genreSlug}/${page}`);
    const list = (json.donghua_list || json.data || json.results || []).map(normalizeItem);
    return { list, hasMore: list.length >= 20 };
  },

  getSchedule: async () => {
    const json = await fetchApi(`/schedule`);
    const raw = json.schedule || json.data || [];
    return { data: Array.isArray(raw) ? raw : [] };
  },

  getSeasons: async (year) => {
    const path = year ? `/seasons/${year}` : `/seasons`;
    const json = await fetchApi(path);
    const list = (json.donghua_list || json.data || []).map(normalizeItem);
    return { data: { animeList: list } };
  },
};

// ─── Seen/New tracking helper ────────────────────────────────────────────────
const SEEN_NEW_KEY = "donghua_seen_new";
export const donghuaSeenNew = {
  isSeen: (key) => {
    try { return JSON.parse(localStorage.getItem(SEEN_NEW_KEY) || "{}")[key] === true; }
    catch { return false; }
  },
  markSeen: (key) => {
    try {
      const obj = JSON.parse(localStorage.getItem(SEEN_NEW_KEY) || "{}");
      obj[key] = true;
      localStorage.setItem(SEEN_NEW_KEY, JSON.stringify(obj));
    } catch {}
  },
};

// ─── Local storage helpers ───────────────────────────────────────────────────

const HISTORY_KEY = "donghua_watch_history";
const SEEN_KEY = "donghua_seen";
const PROGRESS_KEY = "donghua_progress";

export const donghuaStorage = {
  getHistory: () => {
    try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]"); }
    catch { return []; }
  },
  addHistory: (item) => {
    const history = donghuaStorage.getHistory().filter((h) => h.episodeId !== item.episodeId);
    history.unshift({ ...item, watchedAt: new Date().toISOString() });
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 100)));
  },
  clearHistory: () => localStorage.removeItem(HISTORY_KEY),
  removeHistory: (episodeId) => {
    const filtered = donghuaStorage.getHistory().filter((h) => h.episodeId !== episodeId);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(filtered));
  },

  markSeen: (animeId) => {
    const seen = donghuaStorage.getSeen();
    seen[animeId] = true;
    localStorage.setItem(SEEN_KEY, JSON.stringify(seen));
  },
  getSeen: () => {
    try { return JSON.parse(localStorage.getItem(SEEN_KEY) || "{}"); }
    catch { return {}; }
  },

  saveProgress: (episodeId, seconds) => {
    const progress = donghuaStorage.getAllProgress();
    progress[episodeId] = seconds;
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  },
  getProgress: (episodeId) => {
    return donghuaStorage.getAllProgress()[episodeId] || 0;
  },
  getAllProgress: () => {
    try { return JSON.parse(localStorage.getItem(PROGRESS_KEY) || "{}"); }
    catch { return {}; }
  },
};
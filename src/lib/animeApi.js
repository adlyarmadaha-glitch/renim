const BASE = "https://web-production-a1933.up.railway.app/anime";

// Derive a friendly server name from a URL or serverId
function deriveProviderName(urlOrId) {
  if (!urlOrId) return "";
  const PROVIDERS = [
    ["filemoon",   "Filemoon"],
    ["filelions",  "Filelions"],
    ["doodstream", "Doodstream"],
    ["dood.",      "Doodstream"],
    ["ds2play",    "Doodstream"],
    ["streamtape", "Streamtape"],
    ["shott",      "Shott"],
    ["sss.tube",   "SSSstream"],
    ["mp4upload",  "Mp4Upload"],
    ["vidstream",  "Vidstream"],
    ["yourupload", "YourUpload"],
    ["neonime",    "Neonime"],
    ["kuronime",   "Kuronime"],
    ["samehadaku", "Samehadaku"],
    ["otakudesu",  "OtakuDesu"],
    ["animeindo",  "AnimeIndo"],
    ["animeku",    "AnimeKu"],
    ["animension", "Animension"],
    ["pixeldrain", "Pixeldrain"],
    ["krakenfiles","KrakenFiles"],
    ["buzzheavier","BuzzHeavier"],
    ["download",   "Download"],
    ["jwplayer",   "JWPlayer"],
    ["plyr",       "Plyr"],
    ["iframe",     "Stream"],
  ];
  const lower = String(urlOrId).toLowerCase();
  for (const [key, label] of PROVIDERS) {
    if (lower.includes(key)) return label;
  }
  // Try extracting hostname
  try {
    const host = new URL(urlOrId).hostname.replace("www.", "").split(".")[0];
    return host.charAt(0).toUpperCase() + host.slice(1);
  } catch {
    return "";
  }
}

async function fetchApi(path) {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

function normalizeAnime(a) {
  const rawGenres = a.genreList || a.genres || [];
  const genres = rawGenres
    .map((g) => (typeof g === "string" ? g : g.title || g.name || ""))
    .filter(Boolean);

  return {
    animeId:    a.animeId    || a.slug || "",
    title:      a.title      || "",
    poster:     a.poster     || "",
    score:      a.score      ? String(a.score) : "",
    status:     a.status     || "",
    type:       a.type       || "",
    episodes:   a.episodes   || "",
    releaseDay: a.releaseDay || "",
    latestReleaseDate: a.latestReleaseDate || "",
    aired:      a.aired      || "",
    genres,
    episodeList: [],
  };
}

export const animeApi = {

  getHome: async () => {
    const json = await fetchApi("/home");
    const d = json.data || {};
    return {
      data: {
        ongoing:   (d.ongoing?.animeList   || d.ongoing   || []).map(normalizeAnime),
        completed: (d.completed?.animeList || d.completed || []).map(normalizeAnime),
      },
    };
  },

  getOngoing: async (page = 1) => {
    const json = await fetchApi(`/ongoing-anime?page=${page}`);
    const list = (json.data?.animeList || []).map(normalizeAnime);
    return {
      data: { animeList: list },
      pagination: json.pagination || { hasNextPage: list.length >= 20 },
    };
  },

  getCompleted: async (page = 1) => {
    try {
      const json = await fetchApi(`/complete-anime?page=${page}`);
      const rawList = json.data?.animeList || json.animeList || json.data || [];
      const list = (Array.isArray(rawList) ? rawList : []).map(normalizeAnime);
      return {
        data: { animeList: list },
        animeList: list,
        pagination: json.pagination || { hasNextPage: list.length >= 20 },
      };
    } catch {
      // Fallback: try ongoing endpoint filtered by status completed
      try {
        const json2 = await fetchApi(`/completed-anime?page=${page}`);
        const rawList = json2.data?.animeList || json2.animeList || [];
        const list = (Array.isArray(rawList) ? rawList : []).map(normalizeAnime);
        return { data: { animeList: list }, animeList: list, pagination: { hasNextPage: list.length >= 20 } };
      } catch {
        return { data: { animeList: [] }, animeList: [], pagination: { hasNextPage: false } };
      }
    }
  },

  search: async (query) => {
    const json = await fetchApi(`/search/${encodeURIComponent(query)}`);
    return { data: { animeList: (json.data?.animeList || []).map(normalizeAnime) } };
  },

  getAnimeDetail: async (animeId) => {
    const json = await fetchApi(`/anime/${animeId}`);
    const d = json.data;
    if (!d) return { data: null };
    const rawEps = d.episodeList || [];
    // Always sort ascending: Episode 1 first, latest last
    rawEps.sort((a, b) => {
      const n = (e) => {
        const m = String(e.title || e.episodeId || "").match(/(\d+)/g);
        return m ? parseInt(m[m.length - 1]) : 0;
      };
      return n(a) - n(b);
    });
    return {
      data: {
        animeId:       d.animeId      || animeId,
        title:         d.title        || "",
        poster:        d.poster       || "",
        score:         d.score        ? String(d.score) : "",
        status:        d.status       || "",
        type:          d.type         || "",
        synopsis:      Array.isArray(d.synopsis?.paragraphs) ? d.synopsis.paragraphs.join(" ") : (d.synopsis || ""),
        genres:        (d.genreList || d.genres || []).map((g) => typeof g === "string" ? g : g.title || g.name || "").filter(Boolean),
        aired:         d.aired        || "",
        totalEpisodes: d.episodes     ? String(d.episodes) : String(rawEps.length),
        studios:       d.studios      ? (Array.isArray(d.studios) ? d.studios : [d.studios]) : [],
        duration:      d.duration     || "",
        releaseDay:    d.releaseDay   || "",
        batch:         d.batch        || null,
        episodeList:   rawEps,
        recommendedAnimeList: d.recommendedAnimeList || [],
      },
    };
  },

  getEpisode: async (episodeId) => {
    const json = await fetchApi(`/episode/${episodeId}`);
    const d = json.data;
    if (!d) return { data: null };

    const qualityGroups = {};

    // Support multiple API response shapes
    const qualities = d.server?.qualities || d.qualities || d.servers || [];

    if (Array.isArray(qualities) && qualities.length > 0) {
      qualities.forEach((q) => {
        const qName = q.title || q.quality || q.name || "Default";
        if (!qualityGroups[qName]) qualityGroups[qName] = [];
        const serverList = q.serverList || q.servers || [];
        serverList.forEach((s) => {
          const rawId = s.serverId || s.id || s.url || "";
          const rawName = s.title || s.name || s.serverName || "";
          // Prefer provider name derived from URL over generic API-given name
          const derivedName = deriveProviderName(rawId);
          const serverName = derivedName || rawName || `Server ${qualityGroups[qName].length + 1}`;
          qualityGroups[qName].push({ serverId: rawId, serverName, quality: qName });
        });
      });
    }

    // Fallback: flat server list without quality grouping
    if (Object.keys(qualityGroups).length === 0) {
      const flatServers = d.serverList || d.serverlist || [];
      if (flatServers.length > 0) {
        qualityGroups["Default"] = flatServers.map((s, i) => {
          const rawId = s.serverId || s.id || s.url || "";
          const derived = deriveProviderName(rawId);
          return {
            serverId:   rawId,
            serverName: derived || s.title || s.name || `Server ${i + 1}`,
            quality:    "Default",
          };
        });
      }
    }

    if (Object.keys(qualityGroups).length === 0 && (d.defaultStreamingUrl || d.url)) {
      qualityGroups["Default"] = [{
        serverId:   d.defaultStreamingUrl || d.url,
        serverName: deriveProviderName(d.defaultStreamingUrl || d.url) || "Server 1",
        quality:    "Default",
      }];
    }

    // Deduplicate server names within each quality group (add #2, #3 if same name)
    Object.keys(qualityGroups).forEach((q) => {
      const nameCounts = {};
      qualityGroups[q] = qualityGroups[q].map((s) => {
        const base = s.serverName;
        nameCounts[base] = (nameCounts[base] || 0) + 1;
        return { ...s, _nameCount: nameCounts[base] };
      });
      // Second pass: add suffix only where there are dupes
      const totalPerName = {};
      qualityGroups[q].forEach((s) => { totalPerName[s.serverName] = (totalPerName[s.serverName] || 0) + 1; });
      const seen = {};
      qualityGroups[q] = qualityGroups[q].map((s) => {
        const base = s.serverName;
        if (totalPerName[base] > 1) {
          seen[base] = (seen[base] || 0) + 1;
          return { ...s, serverName: `${base} #${seen[base]}` };
        }
        return s;
      });
    });

    return {
      data: {
        episodeId:           episodeId,
        title:               d.title || "Episode",
        animeId:             d.animeId || "",
        defaultStreamingUrl: d.defaultStreamingUrl || d.url || "",
        qualityGroups,
        downloadUrl:         d.downloadUrl || null,
        prevEpisode:         d.prevEpisode || null,
        nextEpisode:         d.nextEpisode || null,
        episodeList:         d.info?.episodeList || d.episodeList || [],
      },
    };
  },

  getServer: async (serverId) => {
    // If serverId is already a URL, return it directly
    if (serverId && (serverId.startsWith("http://") || serverId.startsWith("https://"))) {
      return { data: { url: serverId } };
    }
    try {
      const json = await fetchApi(`/server/${encodeURIComponent(serverId)}`);
      const d = json.data || json;
      // Normalize various URL field names from API
      const url = d?.url || d?.embed || d?.link || d?.streamUrl || d?.src || "";
      return { data: url ? { url } : null };
    } catch {
      return { data: null };
    }
  },

  getSchedule: async () => {
    const json = await fetchApi(`/schedule`);
    // API returns { data: { schedule: [...] } } OR { data: [...] }
    const raw = json.data?.schedule || (Array.isArray(json.data) ? json.data : []);
    const order = ["senin","selasa","rabu","kamis","jumat","sabtu","minggu"];
    const days = raw.map((d) => ({
      day: d.day || "",
      animeList: (d.anime_list || d.animeList || []).map((a) => ({
        animeId: a.slug || a.animeId || "",
        title:   a.title  || "",
        poster:  a.poster || "",
        episode: a.episode || a.latest_episode || "",
        releaseTime: a.time || a.releaseTime || "",
      })),
    }));
    days.sort((a, b) => {
      const ia = order.indexOf((a.day || "").toLowerCase());
      const ib = order.indexOf((b.day || "").toLowerCase());
      return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
    });
    return { data: days };
  },

  getUpcoming: async (page = 1) => {
    // Ambil data dari Jikan MAL API — seasonal current
    const res = await fetch(`https://api.jikan.moe/v4/seasons/now?page=${page}&limit=24`);
    const json = await res.json();
    const list = (json.data || []).map((a) => ({
      animeId: String(a.mal_id),
      title: a.title_indonesian || a.title || "",
      poster: a.images?.jpg?.large_image_url || a.images?.jpg?.image_url || "",
      score: a.score ? String(a.score) : "",
      status: a.status || "",
      type: a.type || "",
      episodes: a.episodes ? String(a.episodes) : "",
      genres: (a.genres || []).map((g) => g.name),
    }));
    const pagination = json.pagination || {};
    return {
      data: { animeList: list },
      pagination: {
        hasPrevPage: page > 1,
        hasNextPage: pagination.has_next_page ?? list.length >= 24,
        totalPages: pagination.last_visible_page || null,
        currentPage: page,
      },
    };
  },

  getGenres: async () => {
    const json = await fetchApi(`/genre`);
    return { data: json.data || [] };
  },

  getGenreAnime: async (genreSlug, page = 1) => {
    // Try main endpoint first, then fallback with different param name
    let json;
    try {
      json = await fetchApi(`/genre/${genreSlug}?page=${page}`);
    } catch {
      json = await fetchApi(`/genre/${genreSlug}`);
    }

    // Some APIs return all data in root .data, others nest it
    let rawList = json.data?.animeList || json.data?.data?.animeList || json.animeList || [];

    // If API doesn't support pagination, do it manually client-side
    const totalItems = rawList.length;
    const PAGE_SIZE = 20;
    let list;
    let serverSupportsPagination = true;

    // Detect if API returned paginated data (correct page) or full dump
    // If page > 1 and we get same count as page 1, API likely doesn't paginate
    if (page > 1 && totalItems > PAGE_SIZE) {
      // API returned full data — slice manually
      serverSupportsPagination = false;
      const start = (page - 1) * PAGE_SIZE;
      list = rawList.slice(start, start + PAGE_SIZE).map(normalizeAnime);
    } else {
      list = rawList.map(normalizeAnime);
    }

    const hasNextPage = serverSupportsPagination
      ? (json.pagination?.hasNextPage ?? json.pagination?.has_next_page ?? list.length >= 18)
      : ((page * PAGE_SIZE) < totalItems);

    return {
      data: { animeList: list, totalItems },
      pagination: {
        hasPrevPage: page > 1,
        hasNextPage,
        currentPage: page,
      },
    };
  },

  getSkipIntro: async (slug, episode = 1) => {
    try {
      const json = await fetchApi(`/skip/${slug}?episode=${episode}`);
      return json.data || null;
    } catch {
      return null;
    }
  },

  getPopular: async (page = 1) => {
    const json = await fetchApi(`/ongoing-anime?page=${page}`);
    const list = (json.data?.animeList || []).map(normalizeAnime);
    return { data: { animeList: list } };
  },
};

export function setApiConfig() {}
export function getApiConfig() { return {}; }
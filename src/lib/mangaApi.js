const MANGA_BASE = "https://www.sankavollerei.com/comic";

// Genres that are safe to show
export const SAFE_GENRES = [
  { value: "action", name: "Action" },
  { value: "adventure", name: "Adventure" },
  { value: "comedy", name: "Comedy" },
  { value: "drama", name: "Drama" },
  { value: "ecchi", name: "Ecchi" },
  { value: "fantasy", name: "Fantasy" },
  { value: "harem", name: "Harem" },
  { value: "historical", name: "Historical" },
  { value: "horror", name: "Horror" },
  { value: "isekai", name: "Isekai" },
  { value: "martial-arts", name: "Martial Arts" },
  { value: "mecha", name: "Mecha" },
  { value: "mystery", name: "Mystery" },
  { value: "psychological", name: "Psychological" },
  { value: "romance", name: "Romance" },
  { value: "school-life", name: "School Life" },
  { value: "sci-fi", name: "Sci-fi" },
  { value: "seinen", name: "Seinen" },
  { value: "shoujo", name: "Shoujo" },
  { value: "shounen", name: "Shounen" },
  { value: "slice-of-life", name: "Slice of Life" },
  { value: "sports", name: "Sports" },
  { value: "supernatural", name: "Supernatural" },
  { value: "thriller", name: "Thriller" },
];

// Blocked adult keywords to filter out (hentai only — ecchi/harem are allowed)
const BLOCKED_KEYWORDS = ["hentai", "xxx", "porn", "18+", "nsfw", "erotic", "adult-only"];

function isAdult(comic) {
  const title = (comic.title || "").toLowerCase();
  const genres = JSON.stringify(comic.genres || comic.genre || "").toLowerCase();
  return BLOCKED_KEYWORDS.some((kw) => title.includes(kw) || genres.includes(kw));
}

// Extract slug from link URL
function slugFromLink(link = "") {
  // e.g. "/manga/black-clover-indonesia/" or "https://komiku.org/manga/black-clover-indonesia/"
  const match = link.match(/\/manga\/([^/]+)\/?$/);
  if (match) return match[1];
  // e.g. "/detail-komik/naruto/" -> "naruto"
  const match2 = link.match(/\/detail-komik\/([^/]+)\/?$/);
  if (match2) return match2[1];
  return link;
}

async function fetchManga(path, retries = 2, timeoutMs = 10000) {
  for (let i = 0; i <= retries; i++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(`${MANGA_BASE}${path}`, { signal: controller.signal });
      clearTimeout(timer);
      if (!res.ok) throw new Error(`Manga API error: ${res.status}`);
      return res.json();
    } catch (err) {
      clearTimeout(timer);
      if (i === retries) throw err;
      await new Promise((r) => setTimeout(r, 500 * (i + 1)));
    }
  }
}

// Detect type from title/link keywords
function detectType(c) {
  const raw = (c.type || c.tipe || "").toLowerCase();
  if (raw.includes("manhwa") || raw === "manhwa") return "Manhwa";
  if (raw.includes("manhua") || raw === "manhua") return "Manhua";
  if (raw.includes("manga") || raw === "manga") return "Manga";
  // Try to guess from title/link
  const combined = ((c.title || "") + (c.link || "") + (c.href || "")).toLowerCase();
  if (combined.includes("manhwa")) return "Manhwa";
  if (combined.includes("manhua")) return "Manhua";
  return "Manga";
}

// Normalize comic from terbaru/populer/trending response
function normalizeComic(c) {
  if (!c) return null;
  if (isAdult(c)) return null;

  const link = c.link || c.href || "";
  const slug = c.slug || slugFromLink(link) || c.komikId || c.id || "";
  if (!slug) return null;

  // isNew: updated within last 48h
  const timeStr = c.time_ago || "";
  const isNew = timeStr.includes("menit") || timeStr.includes("jam") || timeStr === "1 hari lalu" || timeStr.includes("detik");

  return {
    slug,
    title: c.title || c.judul || "",
    poster: c.image || c.cover || c.thumbnail || c.poster || "",
    type: detectType(c),
    status: c.status || "",
    score: c.score || c.rating || "",
    genres: c.genre ? [c.genre] : (c.genres || []),
    latestChapter: c.chapter || c.latestChapter || c.chapter_terbaru || "",
    updatedAt: c.time_ago || c.updated || c.updatedAt || "",
    isNew,
  };
}

export const mangaApi = {
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Layers, Film, ChevronRight, PlayCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { animeApi } from "@/lib/animeApi";

const KNOWN_SERIES = {
  "shingeki-no-kyojin": {
    seriesName: "Attack on Titan",
    keywords: ["shingeki-no-kyojin"],
    parts: [
      { label: "Season 1", animeId: "shingeki-no-kyojin", type: "TV" },
      { label: "Season 2", animeId: "shingeki-no-kyojin-season-2", type: "TV" },
      { label: "Season 3 Part 1", animeId: "shingeki-no-kyojin-season-3", type: "TV" },
      { label: "Season 3 Part 2", animeId: "shingeki-no-kyojin-season-3-part-2", type: "TV" },
      { label: "Final Season Part 1", animeId: "shingeki-no-kyojin-the-final-season", type: "TV" },
      { label: "Final Season Part 2", animeId: "shingeki-no-kyojin-the-final-season-part-2", type: "TV" },
      { label: "The Final Chapters", animeId: "shingeki-no-kyojin-the-final-season-the-final-chapters", type: "Special" },
    ],
  },
  "kimetsu-no-yaiba": {
    seriesName: "Demon Slayer: Kimetsu no Yaiba",
    keywords: ["kimetsu-no-yaiba", "demon-slayer"],
    parts: [
      { label: "Season 1", animeId: "demon-slayer-kimetsu-no-yaiba", type: "TV" },
      { label: "Mugen Train Arc", animeId: "kimetsu-no-yaiba-mugen-ressha-hen", type: "TV" },
      { label: "Entertainment District", animeId: "kimetsu-no-yaiba-yuukaku-hen", type: "TV" },
      { label: "Swordsmith Village", animeId: "kimetsu-no-yaiba-katanakaji-no-sato-hen", type: "TV" },
      { label: "Hashira Training", animeId: "kimetsu-no-yaiba-hashira-geiko-hen", type: "TV" },
    ],
  },
  "jujutsu-kaisen": {
    seriesName: "Jujutsu Kaisen",
    keywords: ["jujutsu-kaisen"],
    parts: [
      { label: "Season 1", animeId: "jujutsu-kaisen", type: "TV" },
      { label: "JJK 0 (Film)", animeId: "jujutsu-kaisen-0-movie", type: "Movie" },
      { label: "Season 2", animeId: "jujutsu-kaisen-2nd-season", type: "TV" },
    ],
  },
  "naruto": {
    seriesName: "Naruto",
    keywords: ["naruto"],
    parts: [
      { label: "Naruto", animeId: "naruto", type: "TV" },
      { label: "Naruto Shippuden", animeId: "naruto-shippuuden", type: "TV" },
      { label: "The Last (Film)", animeId: "the-last-naruto-the-movie", type: "Movie" },
      { label: "Boruto: Next Gen", animeId: "boruto-naruto-next-generations", type: "TV" },
      { label: "Boruto: Two Blue Vortex", animeId: "boruto-two-blue-vortex", type: "TV" },
    ],
  },
  "one-piece": {
    seriesName: "One Piece",
    keywords: ["one-piece"],
    parts: [
      { label: "One Piece", animeId: "one-piece", type: "TV" },
      { label: "Film: Strong World", animeId: "one-piece-film-strong-world", type: "Movie" },
      { label: "Film: Z", animeId: "one-piece-film-z", type: "Movie" },
      { label: "Film: Gold", animeId: "one-piece-film-gold", type: "Movie" },
      { label: "Film: Stampede", animeId: "one-piece-stampede", type: "Movie" },
      { label: "Film: Red", animeId: "one-piece-film-red", type: "Movie" },
    ],
  },
  "bleach": {
    seriesName: "Bleach",
    keywords: ["bleach"],
    parts: [
      { label: "Bleach", animeId: "bleach", type: "TV" },
      { label: "Thousand-Year Blood War", animeId: "bleach-sennen-kessen-hen", type: "TV" },
      { label: "TYBW: The Separation", animeId: "bleach-sennen-kessen-hen-ketsubetsu-tan", type: "TV" },
      { label: "TYBW: The Conflict", animeId: "bleach-sennen-kessen-hen-soukoku-tan", type: "TV" },
    ],
  },
  "fullmetal-alchemist": {
    seriesName: "Fullmetal Alchemist",
    keywords: ["fullmetal-alchemist"],
    parts: [
      { label: "FMA (2003)", animeId: "fullmetal-alchemist", type: "TV" },
      { label: "Brotherhood", animeId: "fullmetal-alchemist-brotherhood", type: "TV" },
      { label: "Sacred Star of Milos", animeId: "fullmetal-alchemist-brotherhood-the-sacred-star-of-milos", type: "Movie" },
    ],
  },
  "dragon-ball": {
    seriesName: "Dragon Ball",
    keywords: ["dragon-ball"],
    parts: [
      { label: "Dragon Ball", animeId: "dragon-ball", type: "TV" },
      { label: "Dragon Ball Z", animeId: "dragon-ball-z", type: "TV" },
      { label: "Dragon Ball GT", animeId: "dragon-ball-gt", type: "TV" },
      { label: "Dragon Ball Super", animeId: "dragon-ball-super", type: "TV" },
      { label: "Super: Broly (Film)", animeId: "dragon-ball-super-broly", type: "Movie" },
      { label: "Super Hero (Film)", animeId: "dragon-ball-super-super-hero", type: "Movie" },
    ],
  },
  "overlord": {
    seriesName: "Overlord",
    keywords: ["overlord"],
    parts: [
      { label: "Season 1", animeId: "overlord", type: "TV" },
      { label: "Season 2", animeId: "overlord-ii", type: "TV" },
      { label: "Season 3", animeId: "overlord-iii", type: "TV" },
      { label: "Season 4", animeId: "overlord-iv", type: "TV" },
    ],
  },
  "re-zero": {
    seriesName: "Re:Zero",
    keywords: ["re-zero-kara"],
    parts: [
      { label: "Season 1", animeId: "re-zero-kara-hajimeru-isekai-seikatsu", type: "TV" },
      { label: "Season 2", animeId: "re-zero-kara-hajimeru-isekai-seikatsu-2nd-season", type: "TV" },
      { label: "Season 2 Part 2", animeId: "re-zero-kara-hajimeru-isekai-seikatsu-2nd-season-part-2", type: "TV" },
      { label: "Season 3", animeId: "re-zero-kara-hajimeru-isekai-seikatsu-3rd-season", type: "TV" },
    ],
  },
  "black-clover": {
    seriesName: "Black Clover",
    keywords: ["black-clover"],
    parts: [
      { label: "Black Clover", animeId: "black-clover", type: "TV" },
      { label: "Sword of the Wizard King", animeId: "black-clover-mahou-tei-no-ken", type: "Movie" },
    ],
  },
  "hunter-x-hunter": {
    seriesName: "Hunter x Hunter",
    keywords: ["hunter-x-hunter"],
    parts: [
      { label: "HxH (1999)", animeId: "hunter-x-hunter", type: "TV" },
      { label: "HxH (2011)", animeId: "hunter-x-hunter-2011", type: "TV" },
    ],
  },
  "boku-no-hero-academia": {
    seriesName: "My Hero Academia",
    keywords: ["boku-no-hero-academia"],
    parts: [
      { label: "Season 1", animeId: "boku-no-hero-academia", type: "TV" },
      { label: "Season 2", animeId: "boku-no-hero-academia-2nd-season", type: "TV" },
      { label: "Season 3", animeId: "boku-no-hero-academia-3rd-season", type: "TV" },
      { label: "Season 4", animeId: "boku-no-hero-academia-4th-season", type: "TV" },
      { label: "Season 5", animeId: "boku-no-hero-academia-5th-season", type: "TV" },
      { label: "Season 6", animeId: "boku-no-hero-academia-6th-season", type: "TV" },
      { label: "Season 7", animeId: "boku-no-hero-academia-7th-season", type: "TV" },
    ],
  },
  "fairy-tail": {
    seriesName: "Fairy Tail",
    keywords: ["fairy-tail"],
    parts: [
      { label: "Fairy Tail", animeId: "fairy-tail", type: "TV" },
      { label: "Fairy Tail (2014)", animeId: "fairy-tail-2014", type: "TV" },
      { label: "Final Series", animeId: "fairy-tail-final-series", type: "TV" },
      { label: "100 Years Quest", animeId: "fairy-tail-100-nen-quest", type: "TV" },
    ],
  },
  "tokyo-ghoul": {
    seriesName: "Tokyo Ghoul",
    keywords: ["tokyo-ghoul"],
    parts: [
      { label: "Tokyo Ghoul", animeId: "tokyo-ghoul", type: "TV" },
      { label: "Tokyo Ghoul √A", animeId: "tokyo-ghoul-a", type: "TV" },
      { label: "Tokyo Ghoul:re", animeId: "tokyo-ghoul-re", type: "TV" },
      { label: "Tokyo Ghoul:re 2nd", animeId: "tokyo-ghoul-re-2nd-season", type: "TV" },
    ],
  },
  "tensei-shitara-slime": {
    seriesName: "That Time I Got Reincarnated as a Slime",
    keywords: ["tensei-shitara-slime"],
    parts: [
      { label: "Season 1", animeId: "tensei-shitara-slime-datta-ken", type: "TV" },
      { label: "Season 2", animeId: "tensei-shitara-slime-datta-ken-2nd-season", type: "TV" },
      { label: "Season 3", animeId: "tensei-shitara-slime-datta-ken-3rd-season", type: "TV" },
    ],
  },
  "mob-psycho-100": {
    seriesName: "Mob Psycho 100",
    keywords: ["mob-psycho"],
    parts: [
      { label: "Season 1", animeId: "mob-psycho-100", type: "TV" },
      { label: "Season 2", animeId: "mob-psycho-100-ii", type: "TV" },
      { label: "Season 3", animeId: "mob-psycho-100-iii", type: "TV" },
    ],
  },
  "vinland-saga": {
    seriesName: "Vinland Saga",
    keywords: ["vinland-saga"],
    parts: [
      { label: "Season 1", animeId: "vinland-saga", type: "TV" },
      { label: "Season 2", animeId: "vinland-saga-season-2", type: "TV" },
    ],
  },
  "youkoso-jitsuryoku-shijou": {
    seriesName: "Classroom of the Elite",
    keywords: ["youkoso-jitsuryoku"],
    parts: [
      { label: "Season 1", animeId: "youkoso-jitsuryoku-shijou-shugi-no-kyoushitsu-e", type: "TV" },
      { label: "Season 2", animeId: "youkoso-jitsuryoku-shijou-shugi-no-kyoushitsu-e-2nd-season", type: "TV" },
      { label: "Season 3", animeId: "youkoso-jitsuryoku-shijou-shugi-no-kyoushitsu-e-3rd-season", type: "TV" },
    ],
  },
  "dr-stone": {
    seriesName: "Dr. Stone",
    keywords: ["dr-stone"],
    parts: [
      { label: "Season 1", animeId: "dr-stone", type: "TV" },
      { label: "Stone Wars", animeId: "dr-stone-stone-wars", type: "TV" },
      { label: "Season 3: New World", animeId: "dr-stone-new-world", type: "TV" },
      { label: "Science Future", animeId: "dr-stone-science-future", type: "TV" },
    ],
  },
  "sword-art-online": {
    seriesName: "Sword Art Online",
    keywords: ["sword-art-online"],
    parts: [
      { label: "Season 1", animeId: "sword-art-online", type: "TV" },
      { label: "Season 2 (GGO)", animeId: "sword-art-online-ii", type: "TV" },
      { label: "Alicization", animeId: "sword-art-online-alicization", type: "TV" },
      { label: "War of Underworld", animeId: "sword-art-online-alicization-war-of-underworld", type: "TV" },
    ],
  },
  "dungeon-ni-deai": {
    seriesName: "DanMachi",
    keywords: ["dungeon-ni-deai", "danmachi"],
    parts: [
      { label: "Season 1", animeId: "dungeon-ni-deai-wo-motomeru-no-wa-machigatteiru-darou-ka", type: "TV" },
      { label: "Season 2", animeId: "dungeon-ni-deai-wo-motomeru-no-wa-machigatteiru-darou-ka-ii", type: "TV" },
      { label: "Season 3", animeId: "dungeon-ni-deai-wo-motomeru-no-wa-machigatteiru-darou-ka-iii", type: "TV" },
      { label: "Season 4", animeId: "dungeon-ni-deai-wo-motomeru-no-wa-machigatteiru-darou-ka-iv", type: "TV" },
    ],
  },
};

const TYPE_COLORS = {
  TV: "bg-primary/10 text-primary border-primary/20",
  Movie: "bg-accent/10 text-accent border-accent/20",
  OVA: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  Special: "bg-green-500/10 text-green-500 border-green-500/20",
};

function findSeries(animeId) {
  for (const series of Object.values(KNOWN_SERIES)) {
    if (series.parts.some((p) => p.animeId === animeId)) return series;
  }
  for (const series of Object.values(KNOWN_SERIES)) {
    if (series.keywords?.some((kw) => animeId.startsWith(kw) || animeId.includes(kw))) return series;
  }
  return null;
}

// Lazy-loading poster card for series parts
function SeriesPartCard({ part, isCurrent }) {
  const [poster, setPoster] = useState(null);

  useEffect(() => {
    const cacheKey = `series_poster_${part.animeId}`;
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) { setPoster(cached); return; }
    animeApi.getAnimeDetail(part.animeId)
      .then((res) => {
        const p = res?.data?.poster;
        if (p) {
          sessionStorage.setItem(cacheKey, p);
          setPoster(p);
        }
      })
      .catch(() => {});
  }, [part.animeId]);

  return (
    <Link to={`/anime/${part.animeId}`}>
      <div className={`group relative flex flex-col rounded-xl overflow-hidden border transition-all ${
        isCurrent
          ? "border-primary ring-2 ring-primary/40 cursor-default"
          : "border-border hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10"
      }`}>
        {/* Poster */}
        <div className="aspect-[3/4] bg-secondary overflow-hidden">
          {poster ? (
            <img src={poster} alt={part.label} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <PlayCircle className="w-6 h-6 text-muted-foreground/20" />
            </div>
          )}
        </div>
        {/* Label overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-2">
          <p className={`text-[10px] font-extrabold leading-tight mb-1 ${isCurrent ? "text-primary" : "text-white"}`}>
            {part.label}
            {isCurrent && <span className="ml-1 text-[8px] bg-primary text-white px-1 rounded-full">Ini</span>}
          </p>
          <Badge className={`text-[8px] font-bold border ${TYPE_COLORS[part.type] || TYPE_COLORS.TV}`}>
            {part.type}
          </Badge>
        </div>
      </div>
    </Link>
  );
}

export default function RelatedSeries({ animeId, recommendedAnimeList = [] }) {
  const series = findSeries(animeId);

  if (!series && recommendedAnimeList.length === 0) return null;

  return (
    <div className="space-y-6">
      {/* Series / Seasons — with posters */}
      {series && (
        <section className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Layers className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-bold">Serial: {series.seriesName}</h3>
            <span className="text-xs text-muted-foreground">({series.parts.length} bagian)</span>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
            {series.parts.map((part, i) => (
              <SeriesPartCard key={i} part={part} isCurrent={part.animeId === animeId} />
            ))}
          </div>
        </section>
      )}

      {/* Recommended from API */}
      {recommendedAnimeList.length > 0 && (
        <section className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Film className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-bold">Rekomendasi Anime</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {recommendedAnimeList.slice(0, 8).map((rec, i) => {
              const id = rec.animeId || rec.slug || "";
              return (
                <Link key={i} to={`/anime/${id}`}>
                  <div className="group space-y-1.5">
                    <div className="aspect-[3/4] rounded-xl overflow-hidden bg-secondary ring-1 ring-border/50">
                      {rec.poster ? (
                        <img src={rec.poster} alt={rec.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <PlayCircle className="w-8 h-8 text-muted-foreground/30" />
                        </div>
                      )}
                    </div>
                    <p className="text-xs font-semibold line-clamp-2 group-hover:text-primary transition-colors">{rec.title}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
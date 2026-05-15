import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { animeApi } from "@/lib/animeApi";
import { Tag } from "lucide-react";

// Fallback genres if API doesn't return them
const FALLBACK_GENRES = [
  { name: "Action", slug: "action" },
  { name: "Adventure", slug: "adventure" },
  { name: "Comedy", slug: "comedy" },
  { name: "Drama", slug: "drama" },
  { name: "Ecchi", slug: "ecchi" },
  { name: "Fantasy", slug: "fantasy" },
  { name: "Horror", slug: "horror" },
  { name: "Isekai", slug: "isekai" },
  { name: "Magic", slug: "magic" },
  { name: "Mecha", slug: "mecha" },
  { name: "Military", slug: "military" },
  { name: "Mystery", slug: "mystery" },
  { name: "Romance", slug: "romance" },
  { name: "School", slug: "school" },
  { name: "Sci-Fi", slug: "sci-fi" },
  { name: "Slice of Life", slug: "slice-of-life" },
  { name: "Sports", slug: "sports" },
  { name: "Supernatural", slug: "supernatural" },
  { name: "Thriller", slug: "thriller" },
];

export default function GenreBar() {
  const { data } = useQuery({
    queryKey: ["genres"],
    queryFn: () => animeApi.getGenres(),
    staleTime: 1000 * 60 * 30,
  });

  const rawGenres = data?.data;
  let genres = FALLBACK_GENRES;

  if (Array.isArray(rawGenres) && rawGenres.length > 0) {
    genres = rawGenres.map((g) => ({
      name: g.title || g.name || g,
      slug: g.slug || g.genreId || (g.title || g.name || g).toLowerCase().replace(/\s+/g, "-"),
    }));
  }

  return (
    <section>
      <div className="flex items-center gap-2 mb-3">
        <Tag className="w-4 h-4 text-primary" />
        <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Genre</h2>
      </div>
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 -mx-1 px-1">
        {genres.map((genre) => (
          <Link
            key={genre.slug}
            to={`/genre/${encodeURIComponent(genre.slug)}`}
            className="shrink-0 px-3 py-1.5 rounded-full bg-secondary hover:bg-primary/15 hover:text-primary border border-border hover:border-primary/30 text-xs font-medium transition-all whitespace-nowrap"
          >
            {genre.name}
          </Link>
        ))}
      </div>
    </section>
  );
}
import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { animeApi } from "@/lib/animeApi";
import AnimeGrid from "@/components/anime/AnimeGrid";
import { AnimeGridSkeleton } from "@/components/anime/LoadingSkeleton";
import Pagination from "@/components/anime/Pagination";
import AnimeFilterSidebar from "@/components/anime/AnimeFilterSidebar";
import { CheckCircle } from "lucide-react";

function matchFilters(anime, filters) {
  if (filters.genre) {
    const genres = (anime.genres || []).map((g) => g.toLowerCase().replace(/\s+/g, "-"));
    if (!genres.includes(filters.genre)) return false;
  }
  if (filters.year) {
    const aired = anime.aired || anime.latestReleaseDate || "";
    if (!aired.includes(filters.year)) return false;
  }
  return true;
}

export default function CompletedAnime() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ genre: "", status: "", year: "" });

  const { data, isLoading } = useQuery({
    queryKey: ["completed", page],
    queryFn: () => animeApi.getCompleted(page),
  });

  const animeList = useMemo(() => {
    const raw = data?.data?.animeList || data?.animeList || [];
    return raw.filter((a) => matchFilters(a, filters));
  }, [data, filters]);

  const handleFilterChange = (f) => {
    setFilters(f);
    setPage(1);
  };

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-heading font-bold">Anime Completed</h1>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Daftar anime yang sudah selesai tayang
        </p>
      </div>

      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <AnimeFilterSidebar filters={filters} onChange={handleFilterChange} />
        {(filters.genre || filters.status || filters.year) && (
          <div className="flex flex-wrap gap-2">
            {filters.genre && (
              <span className="px-2.5 py-1 rounded-full bg-primary/15 border border-primary/30 text-primary text-xs font-semibold">
                Genre: {filters.genre}
              </span>
            )}
            {filters.year && (
              <span className="px-2.5 py-1 rounded-full bg-primary/15 border border-primary/30 text-primary text-xs font-semibold">
                Tahun: {filters.year}
              </span>
            )}
          </div>
        )}
      </div>

      {isLoading ? (
        <AnimeGridSkeleton />
      ) : animeList.length === 0 ? (
        <div className="text-center py-20">
          <CheckCircle className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
          <p className="text-muted-foreground font-semibold">
            {Object.values(filters).some(Boolean) ? "Tidak ada anime sesuai filter" : "Tidak ada anime ditemukan"}
          </p>
          <p className="text-xs text-muted-foreground/60 mt-1">Coba hapus filter atau muat ulang halaman</p>
        </div>
      ) : (
        <>
          <AnimeGrid animeList={animeList} subtitle={`${animeList.length} anime ditemukan di halaman ini`} />
          <Pagination
            pagination={data?.pagination}
            currentPage={page}
            onPageChange={(p) => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }}
          />
        </>
      )}
    </div>
  );
}
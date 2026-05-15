import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({ pagination, currentPage, onPageChange }) {
  if (!pagination) return null;
  const { hasPrevPage, hasNextPage } = pagination;
  if (!hasPrevPage && !hasNextPage) return null;

  return (
    <div className="flex items-center justify-center gap-3 mt-8">
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          onPageChange(currentPage - 1);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        disabled={!hasPrevPage}
        className="gap-1"
      >
        <ChevronLeft className="w-4 h-4" />
        Sebelumnya
      </Button>

      <div className="px-4 py-1.5 rounded-lg bg-secondary text-sm font-semibold">
        Halaman {currentPage}
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          onPageChange(currentPage + 1);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        disabled={!hasNextPage}
        className="gap-1"
      >
        Berikutnya
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );
}
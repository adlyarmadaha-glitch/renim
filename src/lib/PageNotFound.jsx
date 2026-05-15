import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, Ghost } from "lucide-react";

export default function PageNotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center">
        <Ghost className="w-20 h-20 text-primary/40 mx-auto mb-4" />
        <h1 className="text-6xl font-heading font-extrabold text-primary mb-2">404</h1>
        <p className="text-lg text-muted-foreground mb-6">
          Halaman tidak ditemukan
        </p>
        <Link to="/">
          <Button className="gap-2">
            <Home className="w-4 h-4" />
            Kembali ke Beranda
          </Button>
        </Link>
      </div>
    </div>
  );
}
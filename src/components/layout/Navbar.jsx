import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Search, Menu, X, Bookmark, Home, Calendar, PlayCircle, List, Tv, Tv2, Settings, BookOpen, LogIn, Shield, Users, Ticket, Popcorn } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import NotificationBell from "@/components/notification/NotificationBell";
import { firebaseAuth } from "@/lib/firebaseAuth";
import { AnimatePresence } from "framer-motion";
import AuthModal from "@/components/auth/AuthModal";
import UserMenu from "@/components/auth/UserMenu";

const navLinks = [
  { label: "Beranda", path: "/", icon: Home },
  { label: "Ongoing", path: "/ongoing", icon: PlayCircle },
  { label: "Completed", path: "/completed", icon: List },
  { label: "Jadwal", path: "/jadwal", icon: Calendar },
  { label: "Bookmark", path: "/bookmark", icon: Bookmark },
  { label: "Manga", path: "/manga", icon: BookOpen },
  { label: "Donghua", path: "/donghua", icon: Tv2 },
  { label: "Setelan", path: "/settings", icon: Settings },
];

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [user, setUser] = useState(() => firebaseAuth.getUserSync());
  const navigate = useNavigate();
  const location = useLocation();
  const inputRef = useRef(null);

  useEffect(() => {
    // Load fresh user from Firebase on mount
    firebaseAuth.getUser().then(u => { if (u) setUser(u); });
  }, []);

  useEffect(() => {
    const handler = () => firebaseAuth.getUser().then(u => setUser(u));
    window.addEventListener("renime-auth-change", handler);
    return () => window.removeEventListener("renime-auth-change", handler);
  }, []);

  useEffect(() => {
    if (searchOpen && inputRef.current) inputRef.current.focus();
  }, [searchOpen]);

  useEffect(() => {
    const q = new URLSearchParams(location.search).get("q") || "";
    if (location.pathname === "/cari") setSearchQuery(q);
  }, [location]);

  const handleSearch = (e) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    setSearchOpen(false);
    setMobileOpen(false);
    navigate(`/cari?q=${encodeURIComponent(q)}`);
  };

  const handleAuthSuccess = (u) => {
    setUser(u);
    setShowAuthModal(false);
    // Dispatch event so other components can react
    window.dispatchEvent(new Event("renime-auth-change"));
  };

  const handleLogout = () => {
    setUser(null);
    window.dispatchEvent(new Event("renime-auth-change"));
  };

  return (
    <>
      <nav className="sticky top-0 z-50 bg-background/90 backdrop-blur-xl border-b border-border">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/30">
              <Tv className="w-5 h-5 text-white" />
            </div>
            <span className="font-heading font-extrabold text-lg tracking-tight hidden sm:block">
              Re<span className="text-primary">nime</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-0.5">
            {user?.role === "admin" && (
              <Link to="/admin"
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                  location.pathname === "/admin" ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}>
                <Shield className="w-3.5 h-3.5" />Admin
              </Link>
            )}
            {(user?.role === "staff" || user?.role === "admin") && (
              <Link to="/staff"
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                  location.pathname === "/staff" ? "bg-cyan-500/15 text-cyan-400" : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}>
                <Users className="w-3.5 h-3.5" />Staf
              </Link>
            )}
            {user && user.role === "user" && (
              <Link to="/my-tickets"
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                  location.pathname === "/my-tickets" ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}>
                <Ticket className="w-3.5 h-3.5" />Tiket
              </Link>
            )}
            <Link to="/nobar"
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                location.pathname === "/nobar" ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}>
              <Popcorn className="w-3.5 h-3.5" />Nobar
            </Link>
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                  location.pathname === link.path
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Search — desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-sm">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Cari anime..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-secondary border-0 h-9 text-sm focus-visible:ring-primary/40"
              />
            </div>
          </form>

          {/* Right side actions */}
          <div className="flex items-center gap-1.5">
            <NotificationBell />

            {/* Auth */}
            {user ? (
              <UserMenu user={user} onLogout={handleLogout} />
            ) : (
              <Button
                size="sm"
                onClick={() => setShowAuthModal(true)}
                className="gap-1.5 bg-gradient-to-r from-primary to-accent text-white font-bold text-xs shadow-lg shadow-primary/25 hidden sm:flex"
              >
                <LogIn className="w-3.5 h-3.5" />
                Masuk
              </Button>
            )}

            {/* Mobile search icon */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-muted-foreground"
              onClick={() => setSearchOpen((v) => !v)}
            >
              {searchOpen ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
            </Button>

            {/* Mobile Menu */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon" className="text-muted-foreground">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-background w-64 p-0">
                <div className="p-6 space-y-1">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                      <Tv className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-heading font-extrabold text-lg">
                      Re<span className="text-primary">nime</span>
                    </span>
                  </div>

                  {/* Admin/Staff link (mobile) */}
                  {user?.role === "admin" && (
                    <Link to="/admin" onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2 px-3 py-2.5 mb-1 bg-primary/10 text-primary rounded-xl text-sm font-semibold">
                      <Shield className="w-4 h-4" />Panel Admin
                    </Link>
                  )}
                  {(user?.role === "staff" || user?.role === "admin") && (
                    <Link to="/staff" onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2 px-3 py-2.5 mb-1 bg-cyan-500/10 text-cyan-400 rounded-xl text-sm font-semibold">
                      <Users className="w-4 h-4" />Panel Staf
                    </Link>
                  )}
                  {user && user.role === "user" && (
                    <Link to="/my-tickets" onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2 px-3 py-2.5 mb-1 bg-primary/10 text-primary rounded-xl text-sm font-semibold">
                      <Ticket className="w-4 h-4" />Tiket Saya
                    </Link>
                  )}

                  {/* Auth in mobile */}
                  {user ? (
                    <div className="flex items-center gap-2 px-3 py-2.5 mb-2 bg-secondary rounded-xl">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {(user.name || user.email || "U")[0].toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate">{user.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => { setMobileOpen(false); setShowAuthModal(true); }}
                      className="w-full flex items-center gap-2 px-3 py-2.5 mb-2 bg-primary/10 text-primary rounded-xl text-sm font-semibold hover:bg-primary/20 transition-colors"
                    >
                      <LogIn className="w-4 h-4" />
                      Masuk / Daftar
                    </button>
                  )}

                  <Link to="/nobar" onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all ${
                      location.pathname === "/nobar"
                        ? "bg-primary/15 text-primary"
                        : "bg-gradient-to-r from-primary/10 to-accent/10 text-primary border border-primary/20 hover:from-primary/20 hover:to-accent/20"
                    }`}>
                    <Popcorn className="w-4 h-4" /> 🍿 Nonton Bareng
                  </Link>
                  {navLinks.map((link) => {
                    const Icon = link.icon;
                    return (
                      <Link
                        key={link.path}
                        to={link.path}
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                          location.pathname === link.path
                            ? "bg-primary/15 text-primary"
                            : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {link.label}
                      </Link>
                    );
                  })}

                  {user && (
                    <button
                      onClick={() => { firebaseAuth.logout(); setUser(null); setMobileOpen(false); window.dispatchEvent(new Event("renime-auth-change")); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 transition-all mt-2"
                    >
                      <X className="w-4 h-4" />
                      Keluar
                    </button>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Mobile search bar */}
        {searchOpen && (
          <div className="md:hidden border-t border-border px-4 py-2 bg-background">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  ref={inputRef}
                  placeholder="Cari anime..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-secondary border-0 h-9 text-sm"
                />
              </div>
            </form>
          </div>
        )}
      </nav>

      {/* Auth Modal */}
      <AnimatePresence>
        {showAuthModal && (
          <AuthModal
            onClose={() => setShowAuthModal(false)}
            onSuccess={handleAuthSuccess}
          />
        )}
      </AnimatePresence>
    </>
  );
}
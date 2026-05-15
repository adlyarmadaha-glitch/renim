import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, Calendar, Bookmark, BookOpen, Tv2 } from "lucide-react";

const tabs = [
  { label: "Beranda", path: "/", icon: Home },
  { label: "Jadwal", path: "/jadwal", icon: Calendar },
  { label: "Manga", path: "/manga", icon: BookOpen },
  { label: "Donghua", path: "/donghua", icon: Tv2 },
  { label: "Bookmark", path: "/bookmark", icon: Bookmark },
];

export default function BottomTab() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleTabClick = (e, tab) => {
    const isActive =
      tab.path === "/"
        ? location.pathname === "/"
        : location.pathname.startsWith(tab.path);

    if (isActive) {
      // Reset to root of this tab section
      e.preventDefault();
      if (location.pathname !== tab.path) {
        navigate(tab.path, { replace: true });
      } else {
        // Already at root — scroll to top
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-card/95 backdrop-blur-xl border-t border-border"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex items-stretch">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive =
            tab.path === "/"
              ? location.pathname === "/"
              : location.pathname.startsWith(tab.path);
          return (
            <Link
              key={tab.path}
              to={tab.path}
              onClick={(e) => handleTabClick(e, tab)}
              className={`flex-1 flex flex-col items-center justify-center gap-1 py-2.5 min-h-[56px] transition-colors select-none ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <div className={`p-1.5 rounded-lg transition-all ${isActive ? "bg-primary/15" : ""}`}>
                <Icon className={`w-5 h-5 transition-transform ${isActive ? "scale-110" : ""}`} />
              </div>
              <span className="text-[11px] font-medium">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
import React from "react";
import { levelFromTotalExp, rpgStorage } from "@/lib/rpgSystem";

// Bar progress level kecil
export default function LevelBadge({ userId, totalExp, size = "sm" }) {
  const exp = totalExp !== undefined ? totalExp : (rpgStorage.get(userId)?.totalExp || 0);
  const { level, currentExp, nextLevelExp } = levelFromTotalExp(exp);
  const pct = Math.min(100, Math.floor((currentExp / nextLevelExp) * 100));

  if (size === "xs") {
    return (
      <span className="inline-flex items-center gap-1 text-[9px] font-extrabold px-1.5 py-0 rounded-full bg-primary/15 text-primary border border-primary/30">
        ⚡Lv.{level}
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-extrabold text-primary shrink-0">Lv.{level}</span>
      <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden min-w-[60px]">
        <div
          className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-[10px] text-muted-foreground shrink-0">{currentExp}/{nextLevelExp}</span>
    </div>
  );
}
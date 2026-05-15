import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Gem, Star, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { orbStorage, GACHA_COST } from "@/lib/orbSystem";
import { rpgStorage, rollRas, RAS_CONFIG, RARITY_LABEL } from "@/lib/rpgSystem";
import { authStorage } from "@/lib/auth";

const RARITY_STYLE = {
  common:    { bg: "from-slate-800 via-slate-700 to-slate-600",    border: "border-slate-500/40",   glow: "",                         particle: "bg-slate-400" },
  uncommon:  { bg: "from-emerald-900 via-emerald-700 to-emerald-500", border: "border-emerald-400/50", glow: "shadow-emerald-500/50",    particle: "bg-emerald-400" },
  rare:      { bg: "from-blue-900 via-blue-700 to-blue-400",       border: "border-blue-400/60",    glow: "shadow-blue-500/60",        particle: "bg-blue-400" },
  epic:      { bg: "from-purple-900 via-purple-700 to-purple-400", border: "border-purple-400/60",  glow: "shadow-purple-600/70",      particle: "bg-purple-400" },
  legendary: { bg: "from-amber-900 via-yellow-600 to-amber-300",   border: "border-yellow-400/80",  glow: "shadow-yellow-400/80",      particle: "bg-yellow-300" },
};

const RARITY_ORDER = ["common", "uncommon", "rare", "epic", "legendary"];

function OrbBar({ orbs, cost }) {
  const pct = Math.min(100, (orbs / cost) * 100);
  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-500/40 shrink-0">
        <Gem className="w-5 h-5 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-muted-foreground">Orb</span>
          <span className="text-xs font-bold text-foreground">{orbs} <span className="text-muted-foreground font-normal">/ {cost}</span></span>
        </div>
        <div className="h-2.5 bg-secondary rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-400"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        </div>
      </div>
    </div>
  );
}

function Particle({ rarity }) {
  const style = RARITY_STYLE[rarity] || RARITY_STYLE.common;
  return (
    <motion.div
      className={`absolute w-1.5 h-1.5 rounded-full ${style.particle}`}
      initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
      animate={{
        x: (Math.random() - 0.5) * 120,
        y: (Math.random() - 0.5) * 120,
        opacity: 0,
        scale: 0,
      }}
      transition={{ duration: 0.8 + Math.random() * 0.5, ease: "easeOut" }}
      style={{ left: "50%", top: "50%" }}
    />
  );
}

function RarityChanceTable() {
  return (
    <div className="space-y-1.5">
      {RARITY_ORDER.map((r) => {
        const label = RARITY_LABEL[r];
        const entries = Object.entries(RAS_CONFIG).filter(([, v]) => v.rarity === r);
        const total = Object.values(RAS_CONFIG).reduce((s, v) => s + v.weight, 0);
        const chance = entries.reduce((s, [, v]) => s + v.weight, 0);
        const pct = ((chance / total) * 100).toFixed(1);
        return (
          <div key={r} className="flex items-center gap-2">
            <span className={`text-[9px] font-bold w-16 ${label.color}`}>{label.label}</span>
            <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${pct}%`, background: `hsl(var(--primary))` }} />
            </div>
            <span className="text-[9px] text-muted-foreground w-10 text-right">{pct}%</span>
          </div>
        );
      })}
    </div>
  );
}

export default function GachaModal({ onClose }) {
  const user = authStorage.getUser();
  const [orbs, setOrbs] = useState(() => user ? orbStorage.get(user.id) : 0);
  const [result, setResult] = useState(null);
  const [rolling, setRolling] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [showTable, setShowTable] = useState(false);
  const [particles, setParticles] = useState([]);

  if (!user) return null;

  const canGacha = orbs >= GACHA_COST;

  const handleGacha = async () => {
    if (!canGacha || rolling) return;
    setRolling(true);
    setShowResult(false);
    setParticles([]);

    await new Promise((r) => setTimeout(r, 1600));

    const spent = orbStorage.spend(user.id, GACHA_COST);
    if (!spent) { setRolling(false); return; }

    const newRas = rollRas();
    const rasCfg = RAS_CONFIG[newRas];

    const raw = JSON.parse(localStorage.getItem(`renime_rpg_${user.id}`) || "{}");
    raw.ras = newRas;
    localStorage.setItem(`renime_rpg_${user.id}`, JSON.stringify(raw));
    window.dispatchEvent(new CustomEvent("renime-rpg-change", { detail: { userId: user.id } }));

    const newOrbs = orbStorage.get(user.id);
    setOrbs(newOrbs);
    setResult({ ras: newRas, cfg: rasCfg });
    setParticles(Array.from({ length: 12 }, (_, i) => i));
    setRolling(false);
    setShowResult(true);
  };

  const rs = result ? RARITY_STYLE[result.cfg.rarity] || RARITY_STYLE.common : null;
  const isLegendary = result?.cfg?.rarity === "legendary";
  const isEpic = result?.cfg?.rarity === "epic";

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/85 backdrop-blur-md" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, y: 60, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 60, scale: 0.95 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="relative z-10 w-full sm:max-w-sm bg-card border border-border rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col"
        style={{ maxHeight: "min(92vh, 620px)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground z-20 p-1 rounded-lg hover:bg-secondary">
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="shrink-0 relative overflow-hidden bg-gradient-to-br from-purple-900/60 via-card to-indigo-900/40 px-6 pt-6 pb-5 text-center border-b border-border">
          <motion.div
            className="text-5xl mb-2 inline-block"
            animate={{ rotate: [0, -5, 5, -5, 0], scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
          >🔮</motion.div>
          <h2 className="text-xl font-heading font-extrabold bg-gradient-to-r from-purple-300 to-indigo-200 bg-clip-text text-transparent">Gacha Ras</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Ubah takdirmu dengan satu lemparan!</p>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <OrbBar orbs={orbs} cost={GACHA_COST} />

          {/* Result area */}
          <div className="min-h-[140px] flex items-center justify-center">
            <AnimatePresence mode="wait">
              {rolling ? (
                <motion.div key="rolling" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="flex flex-col items-center gap-3">
                  <div className="relative">
                    <motion.div className="w-16 h-16 rounded-full border-4 border-purple-500/30 border-t-purple-500"
                      animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }} />
                    <motion.div className="absolute inset-2 rounded-full border-4 border-indigo-500/30 border-t-indigo-500"
                      animate={{ rotate: -360 }} transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }} />
                    <div className="absolute inset-0 flex items-center justify-center text-2xl">🔮</div>
                  </div>
                  <p className="text-sm font-semibold text-muted-foreground animate-pulse">Melempar nasib...</p>
                </motion.div>
              ) : showResult && result ? (
                <motion.div key="result" initial={{ opacity: 0, scale: 0.5, rotateY: 90 }}
                  animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="relative w-full">
                  <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    {particles.map((i) => <Particle key={i} rarity={result.cfg.rarity} />)}
                  </div>
                  <div className={`relative rounded-2xl bg-gradient-to-br ${rs.bg} p-5 text-center border ${rs.border} shadow-2xl ${rs.glow ? `shadow-2xl ${rs.glow}` : ""}`}>
                    {isLegendary && (
                      <motion.div className="absolute inset-0 rounded-2xl opacity-20" animate={{ rotate: 360 }}
                        transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                        style={{ background: "conic-gradient(from 0deg, transparent 60%, #fde047 70%, transparent 80%)" }} />
                    )}
                    {isEpic && (
                      <motion.div className="absolute inset-0 rounded-2xl opacity-15" animate={{ rotate: -360 }}
                        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                        style={{ background: "conic-gradient(from 0deg, transparent 60%, #a855f7 70%, transparent 80%)" }} />
                    )}
                    <div className="relative z-10">
                      <motion.div animate={{ scale: [1, 1.15, 1], y: [0, -4, 0] }} transition={{ duration: 0.8, repeat: 3 }}
                        className="text-6xl mb-2">{result.cfg.emoji}</motion.div>
                      <div className={`inline-block text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border mb-1 ${rs.border}`}
                        style={{ color: "rgba(255,255,255,0.7)" }}>{RARITY_LABEL[result.cfg.rarity]?.label}</div>
                      <p className="text-white text-2xl font-extrabold">{result.cfg.label}</p>
                      <p className="text-white/70 text-xs mt-1 leading-relaxed">{result.cfg.desc}</p>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div key="idle" className="space-y-3 w-full">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-secondary/60 rounded-xl px-3 py-2.5">
                    <span>📺</span><span>+1 Orb setiap selesai nonton episode</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-secondary/60 rounded-xl px-3 py-2.5">
                    <span>📖</span><span>+1 Orb setiap baca chapter manga</span>
                  </div>
                  <button onClick={() => setShowTable((v) => !v)}
                    className="flex items-center gap-1.5 text-xs text-primary hover:underline w-full justify-center pt-1">
                    <Info className="w-3 h-3" /> Peluang Gacha
                  </button>
                  <AnimatePresence>
                    {showTable && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden bg-secondary/50 rounded-xl p-3">
                        <RarityChanceTable />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Button */}
          <div className="space-y-2">
            <Button onClick={handleGacha} disabled={!canGacha || rolling}
              className="w-full gap-2 h-12 text-base font-extrabold bg-gradient-to-r from-purple-600 via-indigo-500 to-blue-500 hover:from-purple-500 hover:to-blue-400 shadow-lg shadow-purple-600/30 disabled:opacity-50">
              {rolling ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <><Sparkles className="w-5 h-5" /> Gacha! ({GACHA_COST} <Gem className="w-3.5 h-3.5" />)</>
              )}
            </Button>
            {!canGacha && (
              <p className="text-center text-xs text-muted-foreground">
                Kurang <span className="text-primary font-bold">{GACHA_COST - orbs} Orb</span> lagi 🔮
              </p>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
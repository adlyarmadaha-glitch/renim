import React, { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, RotateCw, Check, X, Move } from "lucide-react";
import { motion } from "framer-motion";

// Compress image to target max size (bytes) via canvas quality reduction
async function compressImage(src, maxBytes = 300 * 1024) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      let quality = 0.85;
      const canvas = document.createElement("canvas");
      const MAX_DIM = 800;
      let w = img.naturalWidth;
      let h = img.naturalHeight;
      if (w > MAX_DIM || h > MAX_DIM) {
        const ratio = Math.min(MAX_DIM / w, MAX_DIM / h);
        w = Math.round(w * ratio);
        h = Math.round(h * ratio);
      }
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, w, h);
      // Reduce quality until under maxBytes
      const tryCompress = (q) => {
        const data = canvas.toDataURL("image/jpeg", q);
        const bytes = Math.ceil((data.length - 22) * 3 / 4);
        if (bytes <= maxBytes || q <= 0.3) return data;
        return tryCompress(q - 0.1);
      };
      resolve(tryCompress(quality));
    };
    img.src = src;
  });
}

export default function AvatarCropper({ src, isGif, fileSizeBytes = 0, onConfirm, onCancel }) {
  const SIZE = 260;
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, ox: 0, oy: 0 });
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  const needsCompress = !isGif && fileSizeBytes > 300 * 1024;

  const onMouseDown = (e) => {
    e.preventDefault();
    setDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y };
  };
  const onMouseMove = useCallback((e) => {
    if (!dragging) return;
    setOffset({ x: dragStart.current.ox + (e.clientX - dragStart.current.x), y: dragStart.current.oy + (e.clientY - dragStart.current.y) });
  }, [dragging]);
  const onMouseUp = () => setDragging(false);

  const touchStart = useRef(null);
  const onTouchStart = (e) => {
    if (e.touches.length === 1) {
      const t = e.touches[0];
      touchStart.current = { x: t.clientX, y: t.clientY, ox: offset.x, oy: offset.y };
    }
  };
  const onTouchMove = (e) => {
    e.preventDefault();
    if (e.touches.length === 1 && touchStart.current) {
      const t = e.touches[0];
      setOffset({ x: touchStart.current.ox + (t.clientX - touchStart.current.x), y: touchStart.current.oy + (t.clientY - touchStart.current.y) });
    }
  };

  const onWheel = (e) => {
    e.preventDefault();
    setScale((s) => Math.min(4, Math.max(0.3, s - e.deltaY * 0.005)));
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    return () => {
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("touchmove", onTouchMove);
    };
  }, []);

  const handleConfirm = async () => {
    if (isGif) { onConfirm(src); return; }
    setConfirming(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const OUTPUT = 240;
    canvas.width = OUTPUT;
    canvas.height = OUTPUT;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = async () => {
      ctx.clearRect(0, 0, OUTPUT, OUTPUT);
      ctx.save();
      ctx.beginPath();
      ctx.arc(OUTPUT / 2, OUTPUT / 2, OUTPUT / 2, 0, Math.PI * 2);
      ctx.clip();
      const ratio = OUTPUT / SIZE;
      const scaledW = img.naturalWidth * scale * ratio;
      const scaledH = img.naturalHeight * scale * ratio;
      const dx = (OUTPUT - scaledW) / 2 + offset.x * ratio;
      const dy = (OUTPUT - scaledH) / 2 + offset.y * ratio;
      ctx.drawImage(img, dx, dy, scaledW, scaledH);
      ctx.restore();
      let result = canvas.toDataURL("image/jpeg", 0.85);
      // Auto compress if too large
      const bytes = Math.ceil((result.length - 22) * 3 / 4);
      if (bytes > 300 * 1024) {
        result = await compressImage(result, 300 * 1024);
      }
      setConfirming(false);
      onConfirm(result);
    };
    img.src = src;
  };

  const fileSizeKB = Math.round(fileSizeBytes / 1024);

  return (
    <div className="space-y-4" onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}>
      {/* Title */}
      <div className="text-center space-y-1">
        <p className="text-base font-bold">
          {isGif ? "Preview GIF 🎭" : "Atur Foto Profil"}
        </p>
        <p className="text-xs text-muted-foreground">
          {isGif ? "GIF akan dipakai langsung" : "Drag untuk geser · Scroll/tombol untuk zoom"}
        </p>
        {needsCompress && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-500/15 border border-yellow-500/30 rounded-full text-yellow-400 text-xs font-semibold"
          >
            ⚡ Foto {fileSizeKB}KB akan otomatis dikompres ke &lt;300KB
          </motion.div>
        )}
      </div>

      {/* Preview circle */}
      <div className="flex justify-center">
        <div className="relative">
          {/* Outer glow ring */}
          <div className="absolute -inset-1.5 rounded-full bg-gradient-to-br from-primary/40 to-accent/30 blur-sm" />
          <div
            ref={containerRef}
            className={`relative overflow-hidden rounded-full bg-secondary select-none border-4 border-primary/60 shadow-2xl shadow-primary/30 ${dragging ? "cursor-grabbing" : "cursor-grab"}`}
            style={{ width: SIZE, height: SIZE }}
            onMouseDown={onMouseDown}
            onTouchStart={onTouchStart}
          >
            <img
              src={src}
              alt="preview"
              draggable={false}
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px)) scale(${scale})`,
                maxWidth: "none",
                transformOrigin: "center",
                pointerEvents: "none",
                width: isGif ? "100%" : "auto",
                height: isGif ? "100%" : "auto",
                objectFit: isGif ? "cover" : "initial",
              }}
            />
            {/* Overlay ring inside */}
            <div className="absolute inset-0 rounded-full ring-4 ring-inset ring-background/30 pointer-events-none" />
            {/* Move hint */}
            {!isGif && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100">
                <Move className="w-8 h-8 text-white/40" />
              </div>
            )}
          </div>
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />

      {/* Zoom controls */}
      {!isGif && (
        <div className="flex items-center justify-center gap-2">
          <Button size="icon" variant="outline" className="w-9 h-9 rounded-xl" onClick={() => setScale((s) => Math.max(0.3, +(s - 0.1).toFixed(2)))}>
            <ZoomOut className="w-4 h-4" />
          </Button>

          {/* Slider */}
          <div className="flex-1 max-w-[140px]">
            <input
              type="range"
              min="30" max="400" step="5"
              value={Math.round(scale * 100)}
              onChange={(e) => setScale(parseInt(e.target.value) / 100)}
              className="w-full accent-primary cursor-pointer"
            />
            <p className="text-[10px] text-center text-muted-foreground mt-0.5">{Math.round(scale * 100)}%</p>
          </div>

          <Button size="icon" variant="outline" className="w-9 h-9 rounded-xl" onClick={() => setScale((s) => Math.min(4, +(s + 0.1).toFixed(2)))}>
            <ZoomIn className="w-4 h-4" />
          </Button>

          <Button size="icon" variant="outline" className="w-9 h-9 rounded-xl" title="Reset" onClick={() => { setScale(1); setOffset({ x: 0, y: 0 }); }}>
            <RotateCw className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-2.5 pt-1">
        <Button variant="outline" className="flex-1 rounded-xl gap-1.5" onClick={onCancel}>
          <X className="w-4 h-4" /> Batal
        </Button>
        <Button
          className="flex-1 rounded-xl gap-1.5 bg-primary font-bold shadow-lg shadow-primary/25"
          onClick={handleConfirm}
          disabled={confirming}
        >
          {confirming
            ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            : <Check className="w-4 h-4" />}
          {confirming ? "Memproses..." : "Simpan Foto"}
        </Button>
      </div>
    </div>
  );
}
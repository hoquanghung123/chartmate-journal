import { useEffect, useState } from "react";
import { getChartUrl } from "@/lib/journal";
import { ImageIcon, X } from "lucide-react";

export function TradeImageThumb({ path, label }: { path?: string; label: string }) {
  const [url, setUrl] = useState("");
  const [zoom, setZoom] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!path) { setUrl(""); return; }
    getChartUrl(path).then((u) => { if (!cancelled) setUrl(u); }).catch(() => {});
    return () => { cancelled = true; };
  }, [path]);

  if (!path) {
    return (
      <div className="w-12 h-9 rounded border border-dashed border-terminal-border flex items-center justify-center text-muted-foreground/50">
        <ImageIcon className="w-3 h-3" />
      </div>
    );
  }

  return (
    <>
      <button
        onClick={(e) => { e.stopPropagation(); setZoom(true); }}
        className="w-12 h-9 rounded border border-terminal-border overflow-hidden hover:border-neon-cyan transition"
      >
        {url && <img src={url} alt={label} className="w-full h-full object-cover" />}
      </button>
      {zoom && (
        <div
          onClick={() => setZoom(false)}
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-8 cursor-zoom-out"
        >
          <button className="absolute top-4 right-4 text-white/70 hover:text-white">
            <X className="w-6 h-6" />
          </button>
          <div className="absolute top-4 left-4 px-2 py-1 rounded bg-black/60 text-[10px] tracking-widest text-neon-cyan font-bold">
            {label}
          </div>
          {url && <img src={url} alt={label} className="max-w-full max-h-full object-contain" />}
        </div>
      )}
    </>
  );
}

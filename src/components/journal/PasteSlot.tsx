import { useEffect, useRef, useState } from "react";
import { ImageIcon, ClipboardPaste } from "lucide-react";
import { fileToDataURL, imageFromClipboard } from "@/lib/journal";

interface Props {
  label: string;
  image?: string;
  onChange: (dataUrl: string | undefined) => void;
  focused?: boolean;
  onFocus?: () => void;
  className?: string;
  children?: React.ReactNode;
}

export function PasteSlot({ label, image, onChange, focused, onFocus, className, children }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState(false);

  useEffect(() => {
    if (!focused) return;
    const handler = async (e: ClipboardEvent) => {
      const url = await imageFromClipboard(e);
      if (url) {
        e.preventDefault();
        onChange(url);
      }
    };
    window.addEventListener("paste", handler);
    return () => window.removeEventListener("paste", handler);
  }, [focused, onChange]);

  return (
    <div
      ref={ref}
      tabIndex={0}
      onClick={onFocus}
      onFocus={onFocus}
      onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={async (e) => {
        e.preventDefault(); setDrag(false);
        const f = e.dataTransfer.files?.[0];
        if (f && f.type.startsWith("image/")) onChange(await fileToDataURL(f));
      }}
      className={`relative group rounded-md overflow-hidden border border-terminal-border bg-terminal-bg/60 transition-all cursor-pointer outline-none ${focused ? "neon-focus" : ""} ${drag ? "neon-focus" : ""} ${className ?? ""}`}
    >
      {image ? (
        <img src={image} alt={label} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center gap-1 text-muted-foreground/70 text-[10px] uppercase tracking-wider">
          <ImageIcon className="w-5 h-5 opacity-50" />
          <span>{label}</span>
          <span className="flex items-center gap-1 opacity-60"><ClipboardPaste className="w-3 h-3" /> Ctrl+V</span>
        </div>
      )}
      <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-black/60 text-[9px] uppercase tracking-widest text-neon-cyan font-bold">
        {label}
      </div>
      {children}
    </div>
  );
}

import { useEffect, useMemo, useRef, useState } from "react";
import { Plus, ChevronsRight, Filter, Activity, Terminal as TerminalIcon } from "lucide-react";
import {
  ASSETS, type DayEntry, type SlotKind,
  loadEntries, saveEntries, monthKey, uid,
} from "@/lib/journal";
import { DayColumn } from "./DayColumn";
import { EditDayModal } from "./EditDayModal";

const newEntry = (asset: string): DayEntry => ({
  id: uid(),
  date: new Date().toISOString().slice(0, 10),
  asset,
  weeklyBias: "consolidation",
  weeklyCorrect: false,
  dailyBias: "consolidation",
  dailyCorrect: false,
  h4: {},
});

export function Terminal() {
  const [entries, setEntries] = useState<DayEntry[]>([]);
  const [asset, setAsset] = useState<string>("ALL");
  const [month, setMonth] = useState<string>("ALL");
  const [editing, setEditing] = useState<DayEntry | null>(null);
  const [focusedSlot, setFocusedSlot] = useState<{ id: string; slot: SlotKind } | null>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setEntries(loadEntries()); }, []);
  useEffect(() => { saveEntries(entries); }, [entries]);

  // unfocus on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (!t.closest("[data-slot-root]")) setFocusedSlot(null);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const months = useMemo(() => {
    const set = new Set(entries.map((e) => monthKey(e.date)));
    return Array.from(set).sort();
  }, [entries]);

  const filtered = useMemo(() => {
    return [...entries]
      .filter((e) => (asset === "ALL" ? true : e.asset === asset))
      .filter((e) => (month === "ALL" ? true : monthKey(e.date) === month))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [entries, asset, month]);

  const stats = useMemo(() => {
    const total = filtered.length * 2;
    const correct = filtered.reduce((s, e) => s + (e.weeklyCorrect ? 1 : 0) + (e.dailyCorrect ? 1 : 0), 0);
    const acc = total ? Math.round((correct / total) * 100) : 0;
    return { days: filtered.length, correct, total, acc };
  }, [filtered]);

  const jumpRight = () => {
    const el = scrollerRef.current;
    if (el) el.scrollTo({ left: el.scrollWidth, behavior: "smooth" });
  };

  const addEntry = () => {
    console.log("[ICT] addEntry clicked");
    const e = newEntry(asset === "ALL" ? "XAUUSD" : asset);
    setEntries((p) => { console.log("[ICT] setEntries", p.length, "->", p.length + 1); return [...p, e]; });
    setEditing(e);
    console.log("[ICT] setEditing", e.id);
    setTimeout(jumpRight, 100);
  };

  const upsert = (e: DayEntry) =>
    setEntries((p) => (p.find((x) => x.id === e.id) ? p.map((x) => (x.id === e.id ? e : x)) : [...p, e]));
  const remove = (id: string) => setEntries((p) => p.filter((x) => x.id !== id));

  return (
    <div className="min-h-screen grid-bg">
      {/* Top Nav */}
      <header className="sticky top-0 z-30 glass-strong border-b border-terminal-border">
        <div className="flex items-center gap-4 px-4 py-2.5 flex-wrap">
          <div className="flex items-center gap-2">
            <TerminalIcon className="w-5 h-5 text-neon-cyan text-glow-cyan" />
            <h1 className="text-sm font-bold tracking-[0.3em] text-neon-cyan text-glow-cyan">ICT_JOURNAL</h1>
            <span className="text-[10px] text-muted-foreground tracking-widest">// v1.0 TERMINAL</span>
          </div>

          <button onClick={addEntry}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold tracking-widest bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/60 rounded hover:bg-neon-cyan/30 text-glow-cyan transition-all">
            <Plus className="w-3.5 h-3.5" /> ADD DAY
          </button>

          <div className="flex items-center gap-1 ml-2">
            <button onClick={() => setAsset("ALL")}
              className={`px-2 py-1 text-[10px] font-bold tracking-widest rounded border transition-all ${asset === "ALL" ? "bg-neon-amber/20 text-neon-amber border-neon-amber/60" : "border-terminal-border text-muted-foreground hover:text-foreground"}`}>
              ALL
            </button>
            {ASSETS.map((a) => (
              <button key={a} onClick={() => setAsset(a)}
                className={`px-2 py-1 text-[10px] font-bold tracking-widest rounded border transition-all ${asset === a ? "bg-neon-amber/20 text-neon-amber border-neon-amber/60" : "border-terminal-border text-muted-foreground hover:text-foreground"}`}>
                {a}
              </button>
            ))}
          </div>

          <label className="flex items-center gap-1.5 ml-auto">
            <Filter className="w-3.5 h-3.5 text-muted-foreground" />
            <select value={month} onChange={(e) => setMonth(e.target.value)}
              className="bg-terminal-bg border border-terminal-border rounded px-2 py-1 text-xs outline-none">
              <option value="ALL">All months</option>
              {months.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </label>

          <button onClick={jumpRight}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold tracking-widest border border-terminal-border rounded hover:border-neon-cyan/60 hover:text-neon-cyan transition-all">
            JUMP <ChevronsRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Stats strip */}
        <div className="flex items-center gap-6 px-4 py-1.5 border-t border-terminal-border bg-black/30 text-[10px] tracking-widest">
          <Stat label="DAYS" value={stats.days} />
          <Stat label="CHECKS" value={`${stats.correct}/${stats.total}`} />
          <Stat label="ACC" value={`${stats.acc}%`} accent={stats.acc >= 60 ? "green" : "amber"} />
          <span className="ml-auto flex items-center gap-1.5 text-neon-green">
            <Activity className="w-3 h-3 animate-pulse" /> LIVE
          </span>
        </div>
      </header>

      {/* Timeline */}
      <main className="px-4 py-5">
        {filtered.length === 0 ? (
          <Empty onAdd={addEntry} />
        ) : (
          <div ref={scrollerRef} data-slot-root className="overflow-x-auto scrollbar-terminal pb-4">
            <div className="flex gap-3 min-w-min items-start">
              {filtered.map((e) => (
                <DayColumn
                  key={e.id}
                  entry={e}
                  focusedSlot={focusedSlot}
                  setFocus={setFocusedSlot}
                  onUpdate={upsert}
                  onEdit={setEditing}
                />
              ))}
            </div>
          </div>
        )}
      </main>

      {editing && (
        <EditDayModal
          entry={editing}
          onSave={upsert}
          onDelete={remove}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string | number; accent?: "green" | "amber" }) {
  const color = accent === "green" ? "text-neon-green" : accent === "amber" ? "text-neon-amber" : "text-foreground";
  return (
    <span className="flex items-center gap-1.5">
      <span className="text-muted-foreground">{label}</span>
      <span className={`font-bold ${color}`}>{value}</span>
    </span>
  );
}

function Empty({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="glass rounded-lg p-12 text-center max-w-xl mx-auto mt-12">
      <TerminalIcon className="w-10 h-10 mx-auto text-neon-cyan/60 mb-3" />
      <h2 className="text-lg font-bold tracking-widest text-neon-cyan text-glow-cyan">NO ENTRIES</h2>
      <p className="text-xs text-muted-foreground mt-1 mb-4 tracking-wide">
        // Initialize your journal by adding your first trading day.
      </p>
      <button onClick={onAdd}
        className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold tracking-widest bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/60 rounded hover:bg-neon-cyan/30 text-glow-cyan">
        <Plus className="w-3.5 h-3.5" /> ADD FIRST DAY
      </button>
    </div>
  );
}

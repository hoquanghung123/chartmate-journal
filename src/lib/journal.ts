export type Bias = "bullish" | "bearish" | "consolidation";
export type Session = "ASIA" | "LDN" | "NY";
export type SlotKind = "weekly" | "daily" | "h4-ASIA" | "h4-LDN" | "h4-NY";

export interface DayEntry {
  id: string;
  date: string; // YYYY-MM-DD
  asset: string;
  weeklyImg?: string;
  weeklyBias: Bias;
  weeklyCorrect: boolean;
  dailyImg?: string;
  dailyBias: Bias;
  dailyCorrect: boolean;
  h4: { ASIA?: string; LDN?: string; NY?: string };
  notes?: string;
}

const KEY = "ict-journal-v1";

export const ASSETS = ["XAUUSD", "NQ", "ES", "BTCUSD", "EURUSD", "GBPUSD"];

export function loadEntries(): DayEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveEntries(entries: DayEntry[]) {
  localStorage.setItem(KEY, JSON.stringify(entries));
}

export function weekdayOf(date: string): string {
  const d = new Date(date + "T00:00:00");
  return ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"][d.getDay()];
}

export function ddmm(date: string): string {
  const d = new Date(date + "T00:00:00");
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd}/${mm}`;
}

export function monthKey(date: string): string {
  return date.slice(0, 7); // YYYY-MM
}

export function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export function biasColor(b: Bias) {
  if (b === "bullish") return "bg-bias-bull/20 text-bias-bull border-bias-bull/40";
  if (b === "bearish") return "bg-bias-bear/20 text-bias-bear border-bias-bear/40";
  return "bg-bias-cons/20 text-bias-cons border-bias-cons/40";
}

export function biasLabel(b: Bias) {
  return b === "bullish" ? "BULL" : b === "bearish" ? "BEAR" : "CONS";
}

// Convert clipboard event to dataURL
export async function imageFromClipboard(e: ClipboardEvent): Promise<string | null> {
  const items = e.clipboardData?.items;
  if (!items) return null;
  for (const it of items) {
    if (it.type.startsWith("image/")) {
      const file = it.getAsFile();
      if (!file) continue;
      return await fileToDataURL(file);
    }
  }
  return null;
}

export function fileToDataURL(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result as string);
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}

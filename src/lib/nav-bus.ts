// Tiny pub/sub for cross-page navigation (Bias Expect <-> Trade Log)

type Listener = (entryId: string) => void;
const listeners = new Set<Listener>();

export function onBiasFocus(fn: Listener) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function focusBiasEntry(entryId: string) {
  listeners.forEach((fn) => fn(entryId));
}

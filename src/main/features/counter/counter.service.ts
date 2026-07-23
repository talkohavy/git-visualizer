/**
 * Counter SERVICE - the authoritative counter state lives here, in main.
 *
 * Pure and Electron-free: it just holds a number and lets callers subscribe to
 * changes. The `.ipc.ts` adapter is responsible for turning `onChange` into a
 * broadcast. This separation is what keeps state logic testable.
 */
type Listener = (value: number) => void;

let value = 0;
const listeners = new Set<Listener>();

export function getCount(): number {
  return value;
}

export function increment(by = 1): number {
  value += by;
  for (const listener of listeners) listener(value);
  return value;
}

/** Subscribe to value changes. Returns an unsubscribe function. */
export function onChange(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

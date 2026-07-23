/**
 * Clock SERVICE - a simple heartbeat timer, Electron-free.
 *
 * Emits the current timestamp (ms) to its subscriber roughly once per second
 * while running. The `.ipc.ts` adapter forwards those ticks to renderers.
 */
type TickListener = (timestampMs: number) => void;

const TICK_INTERVAL_MS = 1000;

let timer: NodeJS.Timeout | null = null;
let onTick: TickListener = () => {};

export function setTickListener(listener: TickListener): void {
  onTick = listener;
}

export function setRunning(running: boolean): void {
  if (running) start();
  else stop();
}

function start(): void {
  if (timer) return; // already running
  timer = setInterval(() => onTick(Date.now()), TICK_INTERVAL_MS);
}

function stop(): void {
  if (!timer) return;
  clearInterval(timer);
  timer = null;
}

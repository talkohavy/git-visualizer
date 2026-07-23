import { ipcRenderer } from 'electron';
import type { InvokeSchema, SendSchema, EventSchema } from '@root/common/ipc';

/**
 * ============================================================================
 *  PRELOAD IPC CORE - the renderer-facing half of the bridge.
 * ============================================================================
 *
 * These three generics are the *only* place the preload talks to `ipcRenderer`
 * directly. Everything else (the per-feature wrappers) is built on top of them,
 * so they get full type-safety for free and you never sprinkle raw channel
 * strings across the codebase.
 *
 * Written once - you should essentially never need to touch this file again.
 */

/**
 * Request/response. Mirrors `ipcMain.handle` on the main side.
 *
 * @example const info = await invoke(ApiEvents.SystemGetInfo)
 */
export function invoke<C extends keyof InvokeSchema>(
  channel: C,
  ...args: InvokeSchema[C]['args']
): Promise<InvokeSchema[C]['result']> {
  return ipcRenderer.invoke(channel, ...args);
}

/**
 * Fire-and-forget. Mirrors `ipcMain.on` on the main side. No value comes back.
 *
 * @example send(ApiEvents.CounterIncrement, 5)
 */
export function send<C extends keyof SendSchema>(channel: C, ...args: SendSchema[C]['args']): void {
  ipcRenderer.send(channel, ...args);
}

/**
 * Subscribe to a main -> renderer push channel.
 *
 * Returns an `unsubscribe` function. ALWAYS call it when you're done (e.g. in a
 * React effect cleanup) - forgetting to is the classic Electron memory leak,
 * because `ipcRenderer` listeners live for the lifetime of the window.
 *
 * @example const off = subscribe(ApiEvents.ClockTick, (ts) => setNow(ts)); // later: off()
 */
export function subscribe<C extends keyof EventSchema>(
  channel: C,
  listener: (payload: EventSchema[C]) => void,
): () => void {
  const handler = (_event: Electron.IpcRendererEvent, payload: EventSchema[C]): void => listener(payload);

  ipcRenderer.on(channel, handler);

  return () => {
    ipcRenderer.removeListener(channel, handler);
  };
}

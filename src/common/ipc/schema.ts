import { ApiEvents } from '../constants';
import type { SystemInfo } from './domain';

/**
 * ============================================================================
 *  THE IPC SCHEMA - the single source of truth for every channel in the app.
 * ============================================================================
 *
 * Electron has three flavours of IPC. We model each with its own map so the
 * type system can enforce the right shape at every layer (main, preload,
 * renderer):
 *
 *   1. InvokeSchema  -  request/response.      renderer -> main -> renderer
 *                       (ipcRenderer.invoke  <->  ipcMain.handle)
 *
 *   2. SendSchema    -  fire-and-forget.       renderer -> main
 *                       (ipcRenderer.send    <->  ipcMain.on)
 *
 *   3. EventSchema   -  push / broadcast.      main -> renderer
 *                       (webContents.send    <->  ipcRenderer.on)
 *
 * Channel names are namespaced as `feature:action` so they never collide and
 * are easy to grep.
 *
 * ---------------------------------------------------------------------------
 *  To add a channel you edit exactly THREE places (this file is #1):
 *    1. Add a line to the relevant interface below.
 *    2. Expose it in the matching `preload/features/<feature>.ts`.
 *    3. Implement it in the matching `main/features/<feature>/<feature>.ipc.ts`.
 *  Types then flow automatically to the renderer - no magic strings, no drift.
 * ---------------------------------------------------------------------------
 */

/** Request/response. Each entry declares the call `args` and the `result`. */
export interface InvokeSchema {
  [ApiEvents.SystemGetInfo]: { args: []; result: SystemInfo };
  [ApiEvents.DialogSelectFolder]: { args: []; result: string | null };
  [ApiEvents.CounterGet]: { args: []; result: number };
}

/** Fire-and-forget. No response; only `args`. */
export interface SendSchema {
  [ApiEvents.CounterIncrement]: { args: [by: number] };
  [ApiEvents.ClockSetRunning]: { args: [running: boolean] };
}

/** Main -> renderer push. The value is the event payload. */
export interface EventSchema {
  [ApiEvents.CounterChanged]: number;
  [ApiEvents.ClockTick]: number;
}

/** Union helpers - occasionally handy when writing generic utilities. */
export type InvokeChannel = keyof InvokeSchema;
export type SendChannel = keyof SendSchema;
export type EventChannel = keyof EventSchema;

import { BrowserWindow, ipcMain, type IpcMainInvokeEvent, type IpcMainEvent } from 'electron';
import type { InvokeSchema, SendSchema, EventSchema } from '@root/common/ipc';

/**
 * ============================================================================
 *  MAIN IPC CORE - the main-process half of the bridge.
 * ============================================================================
 *
 * The mirror image of `preload/ipc/core.ts`. These typed wrappers are the only
 * place the main process touches `ipcMain` / `webContents.send` directly, so
 * feature code stays clean and channel names + payloads are checked against the
 * shared schema on this side too.
 */

/**
 * Register a request/response handler (mirrors renderer's `invoke`).
 * Return a value or a Promise; it is delivered back to the caller. Throwing
 * rejects the renderer's promise, so let errors propagate naturally.
 *
 * @example handle(ApiEvents.SystemGetInfo, () => getSystemInfo())
 */
export function handle<C extends keyof InvokeSchema>(
  channel: C,
  handler: (
    event: IpcMainInvokeEvent,
    ...args: InvokeSchema[C]['args']
  ) => InvokeSchema[C]['result'] | Promise<InvokeSchema[C]['result']>,
): void {
  ipcMain.handle(channel, (event, ...args) => handler(event, ...(args as InvokeSchema[C]['args'])));
}

/**
 * Register a fire-and-forget listener (mirrors renderer's `send`).
 *
 * @example on(ApiEvents.CounterIncrement, (_e, by) => service.increment(by))
 */
export function on<C extends keyof SendSchema>(
  channel: C,
  listener: (event: IpcMainEvent, ...args: SendSchema[C]['args']) => void,
): void {
  ipcMain.on(channel, (event, ...args) => listener(event, ...(args as SendSchema[C]['args'])));
}

/**
 * Push an event to a single window's renderer (mirrors renderer's `subscribe`).
 */
export function emit<C extends keyof EventSchema>(window: BrowserWindow, channel: C, payload: EventSchema[C]): void {
  window.webContents.send(channel, payload);
}

/**
 * Push an event to EVERY open window. The common case for global state changes
 * (like our counter) so all windows stay in sync.
 */
export function broadcast<C extends keyof EventSchema>(channel: C, payload: EventSchema[C]): void {
  for (const window of BrowserWindow.getAllWindows()) {
    window.webContents.send(channel, payload);
  }
}

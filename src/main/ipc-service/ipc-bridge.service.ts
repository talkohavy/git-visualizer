import { ipcMain, BrowserWindow, type IpcMainEvent, type IpcMainInvokeEvent } from 'electron';
import type { EventSchema, InvokeSchema, SendSchema } from '@root/common/ipc';

export class IpcBridgeService {
  /**
   * Register a request/response handler (mirrors renderer's `invoke`).
   * Return a value or a Promise; it is delivered back to the caller. Throwing
   * rejects the renderer's promise, so let errors propagate naturally.
   *
   * @example bridge.handle(ApiEvents.SystemGetInfo, () => getSystemInfo())
   */
  handle<C extends keyof InvokeSchema>(
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
   * @example bridge.on(ApiEvents.CounterIncrement, (_e, by) => service.increment(by))
   */
  on<C extends keyof SendSchema>(
    channel: C,
    listener: (event: IpcMainEvent, ...args: SendSchema[C]['args']) => void,
  ): void {
    ipcMain.on(channel, (event, ...args) => listener(event, ...(args as SendSchema[C]['args'])));
  }

  /**
   * Push an event to a single window's renderer (mirrors renderer's `subscribe`).
   */
  emit<C extends keyof EventSchema>(window: BrowserWindow, channel: C, payload: EventSchema[C]): void {
    window.webContents.send(channel, payload);
  }

  /**
   * Push an event to EVERY open window. The common case for global state changes
   * (like our counter) so all windows stay in sync.
   */
  broadcast<C extends keyof EventSchema>(channel: C, payload: EventSchema[C]): void {
    for (const window of BrowserWindow.getAllWindows()) {
      window.webContents.send(channel, payload);
    }
  }
}

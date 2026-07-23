import { registerClockIpc } from '../features/clock/clock.ipc';
import { registerCounterIpc } from '../features/counter/counter.ipc';
import { registerDialogIpc } from '../features/dialog/dialog.ipc';
import { registerSystemIpc } from '../features/system/system.ipc';

/**
 * Single entry point that wires every feature's IPC handlers.
 *
 * `main/index.ts` calls this once, after `app.whenReady()`. To plug in a new
 * feature, write its `register<Feature>Ipc()` and add one line here - the
 * bootstrap file never needs to know the details.
 */
export function registerIpc(): void {
  registerSystemIpc();
  registerDialogIpc();
  registerCounterIpc();
  registerClockIpc();
}

import { registerClockIpc } from './clock/clock.ipc';
import { registerCounterIpc } from './counter/counter.ipc';
import { registerDialogIpc } from './dialog/dialog.ipc';
import { registerSystemIpc } from './system/system.ipc';
import type { IpcBridgeService } from '../ipc-service/ipc-bridge.service';

export function registerIpcFeatures(bridge: IpcBridgeService) {
  registerSystemIpc(bridge);
  registerDialogIpc(bridge);
  registerCounterIpc(bridge);
  registerClockIpc(bridge);
}

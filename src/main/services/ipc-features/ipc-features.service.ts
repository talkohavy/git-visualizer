import { registerClockIpc } from './clock';
import { registerCounterIpc } from './counter';
import { registerDialogIpc } from './dialog';
import { registerSystemIpc } from './system';
import type { IpcBridgeService } from '../ipc-bridge/ipc-bridge.service';

export function registerIpcFeatures(bridge: IpcBridgeService) {
  registerSystemIpc(bridge);
  registerDialogIpc(bridge);
  registerCounterIpc(bridge);
  registerClockIpc(bridge);
}

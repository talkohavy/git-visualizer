import { DialogController } from './controllers/dialog.controller';
import type { IpcBridgeService } from '@main/core/ipc-bridge';

export function initDialogModule(bridge: IpcBridgeService) {
  const dialogController = new DialogController(bridge);

  dialogController.register();
}

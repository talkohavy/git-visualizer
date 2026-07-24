import { ClockController } from './controllers/clock.controllers';
import { ClockService } from './services/clock.service';
import type { IpcBridgeService } from '@main/core/ipc-bridge';

export function initClockModule(bridge: IpcBridgeService) {
  const clockService = new ClockService();

  const clockController = new ClockController(bridge, clockService);

  clockController.register();
}

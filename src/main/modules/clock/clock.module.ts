import { ApiEvents } from '../../../common/constants';
import { ClockController } from './controllers/clock.controllers';
import { ClockService } from './services/clock.service';
import type { IpcBridgeService } from '@main/core/ipc-bridge';

export function initClockModule(bridge: IpcBridgeService) {
  const broadcastTick = (timestampMs: number): void => {
    bridge.broadcast(ApiEvents.ClockTick, timestampMs);
  };

  const clockService = new ClockService(broadcastTick);

  const clockController = new ClockController(bridge, clockService);

  clockController.register();
}

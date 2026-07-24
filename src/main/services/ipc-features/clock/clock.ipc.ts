import { ApiEvents } from '@root/common/constants';
import { ClockService } from './clock.service';
import type { IpcBridgeService } from '../../ipc-bridge';

export function registerClockIpc(bridge: IpcBridgeService): void {
  const clockService = new ClockService();

  const tickListener = (timestampMs: number) => {
    bridge.broadcast(ApiEvents.ClockTick, timestampMs);
  };

  clockService.setTickListener(tickListener);

  bridge.on(ApiEvents.ClockSetRunning, (_event, running) => clockService.setRunning(running));
}

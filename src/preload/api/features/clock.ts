import { ApiEvents } from '@root/common/constants';
import { ipcService } from '../../ipc-service';

export const clock = {
  setRunning: (running: boolean) => ipcService.send(ApiEvents.ClockSetRunning, running),
  onTick: (listener: (timestampMs: number) => void) => ipcService.subscribe(ApiEvents.ClockTick, listener),
};

import { ApiEvents } from '@root/common/constants';
import { ipcService } from '../ipc-service';

/**
 * `window.api.clock` - a heartbeat emitted from MAIN.
 *   - setRunning -> send       (start/stop the ticker)
 *   - onTick     -> subscribe  (receive a timestamp roughly every second)
 */
export const clock = {
  setRunning: (running: boolean) => ipcService.send(ApiEvents.ClockSetRunning, running),
  onTick: (listener: (timestampMs: number) => void) => ipcService.subscribe(ApiEvents.ClockTick, listener),
};

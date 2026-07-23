import { ApiEvents } from '@root/common/constants';
import { send, subscribe } from '../ipc/core';

/**
 * `window.api.clock` - a heartbeat emitted from MAIN.
 *   - setRunning -> send       (start/stop the ticker)
 *   - onTick     -> subscribe  (receive a timestamp roughly every second)
 */
export const clock = {
  setRunning: (running: boolean) => send(ApiEvents.ClockSetRunning, running),
  onTick: (listener: (timestampMs: number) => void) => subscribe(ApiEvents.ClockTick, listener),
};

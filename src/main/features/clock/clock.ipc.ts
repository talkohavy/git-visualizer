import { ApiEvents } from '@root/common/constants';
import { broadcast, on } from '../../ipc/core';
import { setRunning, setTickListener } from './clock.service';

/**
 * Clock IPC adapter.
 *   - on(ApiEvents.ClockSetRunning) -> start/stop the timer
 *   - every tick -> broadcast(ApiEvents.ClockTick) -> push to every window
 */
export function registerClockIpc(): void {
  setTickListener((timestampMs) => broadcast(ApiEvents.ClockTick, timestampMs));

  on(ApiEvents.ClockSetRunning, (_event, running) => setRunning(running));
}

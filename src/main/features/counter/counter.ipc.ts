import { ApiEvents } from '@root/common/constants';
import { broadcast, handle, on } from '../../ipc/core';
import { getCount, increment, onChange } from './counter.service';

/**
 * Counter IPC adapter. Demonstrates all three patterns for one feature:
 *   - handle(ApiEvents.CounterGet)       -> request/response
 *   - on(ApiEvents.CounterIncrement)     -> fire-and-forget mutation
 *   - onChange -> broadcast(ApiEvents.CounterChanged) -> push to every window
 *
 * Broadcasting from the service's change event (rather than only after a
 * `send`) means any future code path that mutates the counter keeps every
 * window in sync automatically.
 */
export function registerCounterIpc(): void {
  handle(ApiEvents.CounterGet, () => getCount());

  on(ApiEvents.CounterIncrement, (_event, by) => increment(by));

  onChange((value) => broadcast(ApiEvents.CounterChanged, value));
}

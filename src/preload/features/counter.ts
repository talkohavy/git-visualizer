import { ApiEvents } from '@root/common/constants';
import { invoke, send, subscribe } from '../ipc/core';

/**
 * `window.api.counter` - a counter whose state lives in the MAIN process.
 *
 * Shows all three IPC patterns cooperating in one feature:
 *   - get        -> invoke     (ask main for the current value)
 *   - increment  -> send       (fire-and-forget mutation)
 *   - onChanged  -> subscribe  (main pushes the new value to every window)
 */
export const counter = {
  get: () => invoke(ApiEvents.CounterGet),
  increment: (by = 1) => send(ApiEvents.CounterIncrement, by),
  onChanged: (listener: (value: number) => void) => subscribe(ApiEvents.CounterChanged, listener),
};

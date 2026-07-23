import { useEffect, useRef } from 'react';

/**
 * Subscribe to a main -> renderer push channel for the lifetime of a component.
 *
 * Every `api.*.on*` method follows the same contract: you hand it a listener and
 * it returns an `unsubscribe` function. This hook wires that into React so the
 * listener is removed on unmount - preventing the leaked-listener bug that bites
 * almost everyone new to Electron.
 *
 * The latest `listener` is kept in a ref, so we subscribe only once (on mount)
 * even if the callback identity changes between renders.
 *
 * @example
 *   useIpcEvent(ipc.clock.onTick, (ts) => setNow(ts))
 *   useIpcEvent(ipc.counter.onChanged, setCount)
 */
export function useIpcEvent<T>(
  subscribe: (listener: (payload: T) => void) => () => void,
  listener: (payload: T) => void,
): void {
  const listenerRef = useRef(listener);

  useEffect(() => {
    listenerRef.current = listener;
  }, [listener]);

  useEffect(() => {
    const unsubscribe = subscribe(listenerRef.current);

    return unsubscribe;
    // `subscribe` is a stable method off `window.api`; intentionally mount-only.
  }, []);
}

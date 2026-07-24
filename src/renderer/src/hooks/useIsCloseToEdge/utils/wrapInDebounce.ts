/**
 * Wraps a function so that it only runs after `delayMs` has elapsed without
 * another call. Local, dependency-free replacement for lodash `debounce`.
 */
export function wrapInDebounce<Args extends unknown[]>(fn: (...args: Args) => void, delayMs: number) {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  return (...args: Args) => {
    if (timeoutId !== undefined) clearTimeout(timeoutId);

    timeoutId = setTimeout(() => fn(...args), delayMs);
  };
}

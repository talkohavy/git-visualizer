import { clock } from './features/clock';
import { counter } from './features/counter';
import { dialog } from './features/dialog';
import { system } from './features/system';

/**
 * The complete, namespaced API surface exposed to the renderer as `window.api`.
 *
 * Grouping by feature is what gives the ergonomic call sites in the renderer:
 *   window.api.system.getInfo()
 *   window.api.counter.increment(5)
 *
 * Add a new feature by importing its wrapper and dropping it in below.
 */
export const api = {
  system,
  dialog,
  counter,
  clock,
};

/**
 * The renderer's `window.api` type is DERIVED from this implementation, so the
 * two can never drift. `preload/index.d.ts` re-exports it onto the global
 * `Window` interface. There is no hand-written parallel type to maintain.
 */
export type RendererApi = typeof api;

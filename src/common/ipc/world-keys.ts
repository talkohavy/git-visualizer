/**
 * Keys under which the preload script exposes objects onto `window` via
 * `contextBridge.exposeInMainWorld`. Centralised so the preload (which writes
 * them) and the renderer typings (which read them) can never disagree.
 */
export const WorldKeys = {
  /** Our typed, namespaced application API -> `window.api`. */
  Api: 'api',
  /** `@electron-toolkit/preload`'s helper API -> `window.electron`. */
  Electron: 'electron',
} as const;

export type WorldKey = (typeof WorldKeys)[keyof typeof WorldKeys];

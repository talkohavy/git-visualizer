/**
 * Shared domain types.
 *
 * These describe the *payloads* that travel across IPC. They live in `common`
 * because they must be understood identically by the main process (producer)
 * and the renderer (consumer). Keep them plain and serializable: IPC uses the
 * structured-clone algorithm, so no class instances, functions, or Dates that
 * you rely on staying Dates (they survive, but prefer primitives when unsure).
 */

/** Returned by `ApiEvents.SystemGetInfo`. */
export interface SystemInfo {
  platform: NodeJS.Platform;
  arch: string;
  /** Electron / Chromium / Node / V8 versions, straight from `process.versions`. */
  versions: {
    electron: string;
    chrome: string;
    node: string;
    v8: string;
  };
  /** Milliseconds the app process has been running. */
  uptimeMs: number;
}

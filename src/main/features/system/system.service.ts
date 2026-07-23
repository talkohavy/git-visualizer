import { arch, platform } from 'process';
import type { SystemInfo } from '@root/common/ipc';

/**
 * SERVICE = pure business logic, no IPC/Electron-window knowledge.
 *
 * Keeping the logic here (rather than inline in the handler) means it can be
 * unit-tested in isolation and reused from anywhere in main. The `.ipc.ts`
 * file is a thin adapter that just exposes this over IPC.
 */
export function getSystemInfo(): SystemInfo {
  return {
    platform,
    arch,
    versions: {
      electron: process.versions.electron,
      chrome: process.versions.chrome,
      node: process.versions.node,
      v8: process.versions.v8,
    },
    uptimeMs: Math.round(process.uptime() * 1000),
  };
}

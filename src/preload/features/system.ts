import { ApiEvents } from '@root/common/constants';
import { ipcService } from '../ipc-service';
import type { SystemInfo } from '@root/common/types';

/**
 * `window.api.system` - read-only info about the host process.
 * A pure request/response feature: one `invoke`, nothing else.
 */
export const system = {
  getInfo: () => ipcService.invoke<SystemInfo | null>(ApiEvents.SystemGetInfo),
};

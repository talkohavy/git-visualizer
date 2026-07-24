import { ApiEvents } from '@root/common/constants';
import { ipcService } from '../../ipc-service';
import type { SystemInfo } from '@root/common/types';

export const system = {
  getInfo: () => ipcService.invoke<SystemInfo | null>(ApiEvents.SystemGetInfo),
};

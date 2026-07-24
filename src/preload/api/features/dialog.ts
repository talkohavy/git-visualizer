import { ApiEvents } from '@root/common/constants';
import { ipcService } from '../../ipc-service';

export const dialog = {
  selectFolder: () => ipcService.invoke<string | null>(ApiEvents.DialogSelectFolder),
};

import { ApiEvents } from '@root/common/constants';
import { ipcService } from '../ipc-service';

/**
 * `window.api.dialog` - native OS dialogs, which can only run in main.
 * `selectFolder` resolves to the chosen absolute path, or `null` if cancelled.
 */
export const dialog = {
  selectFolder: () => ipcService.invoke<string | null>(ApiEvents.DialogSelectFolder),
};

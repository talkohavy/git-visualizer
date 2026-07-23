import { ApiEvents } from '@root/common/constants';
import { invoke } from '../ipc/core';

/**
 * `window.api.dialog` - native OS dialogs, which can only run in main.
 * `selectFolder` resolves to the chosen absolute path, or `null` if cancelled.
 */
export const dialog = {
  selectFolder: () => invoke(ApiEvents.DialogSelectFolder),
};

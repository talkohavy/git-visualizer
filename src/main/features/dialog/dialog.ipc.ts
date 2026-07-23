import { ApiEvents } from '@root/common/constants';
import { BrowserWindow, dialog, type OpenDialogOptions } from 'electron';
import { handle } from '../../ipc/core';

/**
 * Dialog feature. It's a thin wrapper over Electron's native `dialog` API, so
 * there's no separate service - the handler *is* the logic.
 *
 * We anchor the dialog to the window that made the request (via the invoke
 * `event`) so it appears as a proper sheet/modal on macOS.
 */
export function registerDialogIpc(): void {
  handle(ApiEvents.DialogSelectFolder, async (event) => {
    const parent = BrowserWindow.fromWebContents(event.sender);
    const options: OpenDialogOptions = {
      title: 'Select a folder',
      properties: ['openDirectory', 'createDirectory'],
    };

    const result = parent ? await dialog.showOpenDialog(parent, options) : await dialog.showOpenDialog(options);

    if (result.canceled || result.filePaths.length === 0) return null;
    return result.filePaths[0] ?? null;
  });
}

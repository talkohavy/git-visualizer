import { ApiEvents } from '@root/common/constants';
import { BrowserWindow, dialog, type OpenDialogOptions } from 'electron';
import type { IpcBridgeService } from '@main/core/ipc-bridge';

export class DialogController {
  constructor(private readonly bridge: IpcBridgeService) {}

  register(): void {
    this.selectFolder();
  }

  private selectFolder() {
    this.bridge.handle(ApiEvents.DialogSelectFolder, async (event) => {
      const parent = BrowserWindow.fromWebContents(event.sender);

      const options: OpenDialogOptions = {
        title: 'Select a folder',
        properties: ['openDirectory', 'createDirectory'],
      };

      const result = parent ? await dialog.showOpenDialog(parent, options) : await dialog.showOpenDialog(options);

      if (result.canceled || result.filePaths.length === 0) return null;

      const retValue = result.filePaths[0] ?? null;

      return retValue;
    });
  }
}

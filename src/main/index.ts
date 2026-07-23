import { electronApp, optimizer } from '@electron-toolkit/utils';
import { ElectronEvents } from '@root/common/constants';
import { app, BrowserWindow } from 'electron';
import { registerIpc } from './ipc/register';
import { createWindow } from './windows/createWindow';

/**
 * Main-process bootstrap. Deliberately thin: it orchestrates app lifecycle and
 * delegates the two things that matter to dedicated modules -
 *   - `registerIpc()`  -> all feature IPC handlers (see `main/ipc/register.ts`)
 *   - `createWindow()`  -> window creation (see `main/windows/createWindow.ts`)
 */
startApp();

async function startApp(): Promise<void> {
  // On macOS apps typically stay alive until the user quits with Cmd+Q.
  app.on(ElectronEvents.WindowAllClosed, () => {
    if (process.platform !== 'darwin') app.quit();
  });

  await app.whenReady();
  handleAppIsReady();
}

function handleAppIsReady(): void {
  electronApp.setAppUserModelId('com.electron');

  // F12 toggles DevTools in dev; ignore Cmd/Ctrl+R in production.
  app.on(ElectronEvents.BrowserWindowCreated, (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  // Register every feature's IPC handlers exactly once, before any window can
  // send messages. Adding a feature never touches this file - see register.ts.
  registerIpc();

  createWindow();

  // On macOS, re-create a window when the dock icon is clicked with none open.
  app.on(ElectronEvents.Activate, () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
}

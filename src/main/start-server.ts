import { electronApp, optimizer } from '@electron-toolkit/utils';
import { ElectronEvents } from '@root/common/constants';
import { app, BrowserWindow } from 'electron';
import { registerIpcFeatures } from './ipc-features';
import { IpcBridgeService } from './ipc-service/ipc-bridge.service';
import { createWindow } from './windows/createWindow';

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
    optimizer.watchWindowShortcuts(window, {
      zoom: true,
      escToCloseWindow: true,
    });
  });

  const ipcBridgeService = new IpcBridgeService();

  registerIpcFeatures(ipcBridgeService);

  createWindow();

  // On macOS, re-create a window when the dock icon is clicked with none open.
  app.on(ElectronEvents.Activate, () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
}

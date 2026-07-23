export const ElectronEvents = {
  WindowAllClosed: 'window-all-closed',
  BrowserWindowCreated: 'browser-window-created',
  Activate: 'activate',
} as const;

export type ElectronEventValues = (typeof ElectronEvents)[keyof typeof ElectronEvents];

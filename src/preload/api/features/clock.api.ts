import { ApiEvents } from '@root/common/constants';
import type { IpcService } from '@preload/ipc-service';

export class ClockApi {
  #ipc: IpcService;

  constructor(ipc: IpcService) {
    this.#ipc = ipc;
  }

  setRunning = (running: boolean): void => this.#ipc.send(ApiEvents.ClockSetRunning, running);

  onTick = (listener: (timestampMs: number) => void): (() => void) =>
    this.#ipc.subscribe(ApiEvents.ClockTick, listener);
}

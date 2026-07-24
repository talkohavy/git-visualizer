import { ApiEvents } from '@root/common/constants';
import type { IpcService } from '@preload/ipc-service';

export class CounterApi {
  #ipc: IpcService;

  constructor(ipc: IpcService) {
    this.#ipc = ipc;
  }

  get = (): Promise<number> => this.#ipc.invoke<number>(ApiEvents.CounterGet);

  increment = (by = 1): void => this.#ipc.send(ApiEvents.CounterIncrement, by);

  onChanged = (listener: (value: number) => void): (() => void) =>
    this.#ipc.subscribe(ApiEvents.CounterChanged, listener);
}

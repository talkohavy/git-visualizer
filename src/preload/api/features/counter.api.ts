import { ApiEvents } from '@root/common/constants';
import type { IpcService } from '@preload/ipc-service';

export class CounterApi {
  #ipc: IpcService;

  constructor(ipc: IpcService) {
    this.#ipc = ipc;
  }

  get(): Promise<number> {
    return this.#ipc.invoke<number>(ApiEvents.CounterGet);
  }

  increment(by = 1): void {
    this.#ipc.send(ApiEvents.CounterIncrement, by);
  }

  onChanged(listener: (value: number) => void): () => void {
    return this.#ipc.subscribe(ApiEvents.CounterChanged, listener);
  }
}

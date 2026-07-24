import { ApiEvents } from '@root/common/constants';
import type { IpcService } from '@preload/ipc-service';

export class DialogApi {
  #ipc: IpcService;

  constructor(ipc: IpcService) {
    this.#ipc = ipc;
  }

  selectFolder = (): Promise<string | null> => this.#ipc.invoke<string | null>(ApiEvents.DialogSelectFolder);
}

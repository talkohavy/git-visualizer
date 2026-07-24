import { ClockApi } from './features/clock.api';
import { CounterApi } from './features/counter.api';
import { DialogApi } from './features/dialog.api';
import { SystemApi } from './features/system.api';
import type { IpcService } from '../ipc-service';

export class Api {
  readonly system: SystemApi;
  readonly dialog: DialogApi;
  readonly counter: CounterApi;
  readonly clock: ClockApi;

  constructor(ipc: IpcService) {
    this.system = new SystemApi(ipc);
    this.dialog = new DialogApi(ipc);
    this.counter = new CounterApi(ipc);
    this.clock = new ClockApi(ipc);
  }
}

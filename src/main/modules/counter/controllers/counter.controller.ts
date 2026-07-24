import { ApiEvents } from '@root/common/constants';
import type { IpcBridgeService } from '@main/core/ipc-bridge';
import type { CounterService } from '../services/counter.service';

export class CounterController {
  constructor(
    private readonly bridge: IpcBridgeService,
    private readonly counterService: CounterService,
  ) {}

  register(): void {
    this.bridge.handle(ApiEvents.CounterGet, () => this.counterService.getCount());

    this.bridge.on(ApiEvents.CounterIncrement, (_event, by) => this.counterService.increment(by));

    this.counterService.onChange((value) => this.bridge.broadcast(ApiEvents.CounterChanged, value));
  }
}

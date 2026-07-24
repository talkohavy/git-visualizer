import { ApiEvents } from '@root/common/constants';
import type { IpcBridgeService } from '@main/core/ipc-bridge';
import type { CounterService } from '../services/counter.service';

export class CounterController {
  constructor(
    private readonly bridge: IpcBridgeService,
    private readonly counterService: CounterService,
  ) {}

  register(): void {
    this.getCount();
    this.setCount();
    this.counterIncrement();
  }

  private getCount() {
    this.bridge.handle(ApiEvents.CounterGet, this.counterService.getCount.bind(this.counterService));
  }

  private setCount() {
    this.counterService.onChange((value) => {
      return this.bridge.broadcast(ApiEvents.CounterChanged, value);
    });
  }

  private counterIncrement() {
    this.bridge.on(ApiEvents.CounterIncrement, (_event, by) => this.counterService.increment(by));
  }
}

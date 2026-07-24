import { ApiEvents } from '@root/common/constants';
import type { IpcBridgeService } from '@main/core/ipc-bridge';
import type { ClockService } from '../services/clock.service';

export class ClockController {
  constructor(
    private readonly bridge: IpcBridgeService,
    private readonly clockService: ClockService,
  ) {}

  register(): void {
    this.startRunningClock();
  }

  private startRunningClock() {
    this.bridge.on(ApiEvents.ClockSetRunning, (_event, running) => {
      this.clockService.setRunning(running);
    });
  }
}

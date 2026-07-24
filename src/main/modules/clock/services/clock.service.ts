import { TICK_INTERVAL_MS } from '../logic/constants';
import type { TickListener } from '../types';

export class ClockService {
  private setIntervalId: NodeJS.Timeout | null = null;

  constructor(private readonly onTick: TickListener) {}

  setRunning(running: boolean): void {
    if (running) return void this.start();

    this.stop();
  }

  private start(): void {
    if (this.setIntervalId) return;

    this.setIntervalId = setInterval(() => {
      this.onTick(Date.now());
    }, TICK_INTERVAL_MS);
  }

  private stop(): void {
    if (!this.setIntervalId) return;

    clearInterval(this.setIntervalId);

    this.setIntervalId = null;
  }
}

import { ApiEvents } from '@root/common/constants';
import { CounterService } from './counter.service';
import type { IpcBridgeService } from '../../ipc-bridge';

export function registerCounterIpc(bridge: IpcBridgeService): void {
  const counterService = new CounterService();

  bridge.handle(ApiEvents.CounterGet, () => counterService.getCount());

  bridge.on(ApiEvents.CounterIncrement, (_event, by) => counterService.increment(by));

  counterService.onChange((value) => bridge.broadcast(ApiEvents.CounterChanged, value));
}

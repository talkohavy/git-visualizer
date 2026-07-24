import { ApiEvents } from '@root/common/constants';
import { ipcService } from '../../ipc-service';

export const counter = {
  get: () => ipcService.invoke<number>(ApiEvents.CounterGet),
  increment: (by = 1) => ipcService.send(ApiEvents.CounterIncrement, by),
  onChanged: (listener: (value: number) => void) => ipcService.subscribe(ApiEvents.CounterChanged, listener),
};

import { CounterController } from './controllers/counter.controller';
import { CounterService } from './services/counter.service';
import type { IpcBridgeService } from '../../core/ipc-bridge';

export function initCounterModule(bridge: IpcBridgeService) {
  const counterService = new CounterService();

  const counterController = new CounterController(bridge, counterService);

  counterController.register();
}

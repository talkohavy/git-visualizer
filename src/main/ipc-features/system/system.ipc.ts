import { ApiEvents } from '../../../common/constants';
import { SystemService } from './system.service';
import type { IpcBridgeService } from '../../ipc-service/ipc-bridge.service';

/**
 * IPC = thin adapter. Maps schema channels to service calls. No logic here.
 */
export function registerSystemIpc(bridge: IpcBridgeService): void {
  const systemService = new SystemService();

  bridge.handle(ApiEvents.SystemGetInfo, () => systemService.getSystemInfo());
}

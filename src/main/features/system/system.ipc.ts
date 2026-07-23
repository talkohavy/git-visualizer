import { ApiEvents } from '../../../common/constants';
import { handle } from '../../ipc/core';
import { getSystemInfo } from './system.service';

/**
 * IPC = thin adapter. Maps schema channels to service calls. No logic here.
 */
export function registerSystemIpc(): void {
  handle(ApiEvents.SystemGetInfo, () => getSystemInfo());
}

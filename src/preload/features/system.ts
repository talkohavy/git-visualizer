import { ApiEvents } from '@root/common/constants';
import { invoke } from '../ipc/core';

/**
 * `window.api.system` - read-only info about the host process.
 * A pure request/response feature: one `invoke`, nothing else.
 */
export const system = {
  getInfo: () => invoke(ApiEvents.SystemGetInfo),
};

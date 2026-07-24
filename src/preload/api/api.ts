import { DialogApi } from './features/dialog.api';
import { GitApi } from './features/git.api';
import type { IpcService } from '../ipc-service';

/**
 * Price to pay:
 *
 * 1. contextBridge strips prototype methods.
 * It only clones an object's own enumerable properties.
 *
 * Therefore, each API should define its public methods as an arrow-function class field,
 * so they survive the bridge.
 *
 * 2. Not leaking the injected dependency.
 * A normal private ipc (or constructor-param property) compiles to an own enumerable field,
 * which contextBridge would then clone onto window.api.git.ipc.
 * I used a hard-private #ipc field, which is invisible to property enumeration,
 * so the dependency stays truly internal.
 */
export class Api {
  readonly dialog: DialogApi;
  readonly git: GitApi;

  constructor(ipc: IpcService) {
    this.dialog = new DialogApi(ipc);
    this.git = new GitApi(ipc);
  }
}

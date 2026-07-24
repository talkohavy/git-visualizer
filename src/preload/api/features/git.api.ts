import { ApiEvents } from '@root/common/constants';
import type { IpcService } from '@preload/ipc-service';
import type { GitGraphResult } from '@root/common/types/git';

export class GitApi {
  #ipc: IpcService;

  constructor(ipc: IpcService) {
    this.#ipc = ipc;
  }

  getGraph = (repoPath: string): Promise<GitGraphResult> =>
    this.#ipc.invoke<GitGraphResult>(ApiEvents.GitGetGraph, repoPath);
}

import { ApiEvents } from '@root/common/constants';
import type { IpcBridgeService } from '@main/core/ipc-bridge';
import type { GitService } from '../services/git.service';

export class GitController {
  constructor(
    private readonly bridge: IpcBridgeService,
    private readonly gitService: GitService,
  ) {}

  register(): void {
    this.getGraph();
  }

  private getGraph() {
    this.bridge.handle(ApiEvents.GitGetGraph, (_event, repoPath: string) => this.gitService.getGraph(repoPath));
  }
}

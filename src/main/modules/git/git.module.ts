import { GitController } from './controllers/git.controller';
import { GitService } from './services/git.service';
import type { IpcBridgeService } from '../../core/ipc-bridge';

export function initGitModule(bridge: IpcBridgeService) {
  const gitService = new GitService();

  const gitController = new GitController(bridge, gitService);

  gitController.register();
}

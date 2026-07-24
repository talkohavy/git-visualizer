import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { toGitModel } from '../logic/utils/toGitModel';
import type { GitGraphResult } from '@root/common/types/git';
import type { RawBranch, RawCommit } from '../types';

const execFileAsync = promisify(execFile);

export class GitService {
  /**
   * Reads a repository on disk and converts its history into a `GitModel`.
   * Never throws: failures are returned as a typed `GitGraphResult`.
   */
  async getGraph(repoPath: string): Promise<GitGraphResult> {
    if (!repoPath) {
      return { ok: false, reason: 'error', message: 'No repository path was provided.' };
    }

    try {
      const isRepo = await this.isInsideWorkTree(repoPath);

      if (!isRepo) {
        return { ok: false, reason: 'not-a-repo', message: 'The selected folder is not a git repository.' };
      }

      const [commits, branches, head] = await Promise.all([
        this.readCommits(repoPath),
        this.readBranches(repoPath),
        this.readHead(repoPath),
      ]);

      if (commits.length === 0) {
        return { ok: false, reason: 'empty', message: 'This repository has no commits yet.' };
      }

      const model = toGitModel({ commits, branches, head });

      return { ok: true, model };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to read the repository.';

      return { ok: false, reason: 'error', message };
    }
  }

  private async run(repoPath: string, args: string[]): Promise<string> {
    const { stdout } = await execFileAsync('git', ['-C', repoPath, ...args], {
      maxBuffer: 64 * 1024 * 1024,
      windowsHide: true,
    });

    return stdout;
  }

  private async isInsideWorkTree(repoPath: string): Promise<boolean> {
    try {
      const stdout = await this.run(repoPath, ['rev-parse', '--is-inside-work-tree']);

      return stdout.trim() === 'true';
    } catch {
      return false;
    }
  }

  private async readCommits(repoPath: string): Promise<RawCommit[]> {
    // Space is a safe separator: a commit hash never contains spaces and parent
    // hashes are already space-delimited. (A NUL separator can't be used because
    // execFile forbids NUL bytes in arguments.)
    const stdout = await this.run(repoPath, ['log', '--all', '--date-order', '--pretty=format:%H %P']);

    return stdout
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .map((line) => {
        const [hash = '', ...parents] = line.split(' ').filter(Boolean);

        return { hash, parents };
      });
  }

  private async readBranches(repoPath: string): Promise<RawBranch[]> {
    // Branch ref names cannot contain spaces, so a space cleanly separates the
    // name from the commit hash it points at. Include remote-tracking branches
    // (refs/remotes) so commits that are only pointed at by a remote branch
    // still get a label.
    const stdout = await this.run(repoPath, [
      'for-each-ref',
      '--format=%(refname:short) %(objectname)',
      'refs/heads',
      'refs/remotes',
    ]);

    return stdout
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .map((line) => {
        const [name = '', tip = ''] = line.split(' ').filter(Boolean);

        return { name, tip };
      })
      // Skip symbolic refs like `origin/HEAD`, which merely alias another branch.
      .filter((branch) => branch.name.length > 0 && !branch.name.endsWith('/HEAD'));
  }

  private async readHead(repoPath: string): Promise<string> {
    const stdout = await this.run(repoPath, ['rev-parse', '--abbrev-ref', 'HEAD']);

    return stdout.trim();
  }
}

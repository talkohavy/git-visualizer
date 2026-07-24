/**
 * Raw, parsed output of the git CLI before it is turned into a `GitModel`.
 */

export type RawCommit = {
  hash: string;
  /**
   * Parent hashes in git's own order: `[firstParent, ...mergedInParents]`.
   */
  parents: string[];
};

export type RawBranch = {
  name: string;
  /**
   * Hash the branch ref points at (its newest commit).
   */
  tip: string;
};

export type RawHistory = {
  /**
   * Commits as returned by `git log --all --date-order` (newest first).
   */
  commits: RawCommit[];
  branches: RawBranch[];
  /**
   * The checked-out branch name, or `HEAD` when detached.
   */
  head: string;
};

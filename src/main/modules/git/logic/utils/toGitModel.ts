import { BRANCH_PALETTE, DEFAULT_COLOR, TRUNK_NAMES } from '../constants';
import type { BranchInfo, Commit, GitModel } from '@root/common/types/git';
import type { RawHistory } from '../../types';

export function toGitModel(history: RawHistory): GitModel {
  const { commits: rawCommits, branches: rawBranches, head } = history;

  // 1. Contiguous order: oldest = 0 (bottom), newest = n-1 (top). git log
  // --date-order is newest-first and never lists a parent before its children,
  // so reversing yields a valid bottom-to-top ordering.
  const oldestFirst = [...rawCommits].reverse();
  const orderByHash = new Map<string, number>();
  oldestFirst.forEach((commit, index) => {
    orderByHash.set(commit.hash, index);
  });

  const parentsByHash = new Map<string, string[]>();
  rawCommits.forEach((commit) => {
    parentsByHash.set(commit.hash, commit.parents);
  });

  // 2. Branch claiming priority. Trunk names first, then whichever branch can
  // walk the longest first-parent chain (the most mainline-like), then by name
  // for determinism.
  const firstParentChainLength = (tip: string): number => {
    let length = 0;
    let current: string | undefined = tip;
    const seen = new Set<string>();

    while (current && parentsByHash.has(current) && !seen.has(current)) {
      seen.add(current);
      length += 1;
      current = parentsByHash.get(current)?.[0];
    }

    return length;
  };

  const branchPriority = [...rawBranches].sort((a, b) => {
    const aTrunk = TRUNK_NAMES.indexOf(a.name);
    const bTrunk = TRUNK_NAMES.indexOf(b.name);
    const aRank = aTrunk === -1 ? TRUNK_NAMES.length : aTrunk;
    const bRank = bTrunk === -1 ? TRUNK_NAMES.length : bTrunk;

    if (aRank !== bRank) {
      return aRank - bRank;
    }

    const lengthDiff = firstParentChainLength(b.tip) - firstParentChainLength(a.tip);
    if (lengthDiff !== 0) {
      return lengthDiff;
    }

    return a.name.localeCompare(b.name);
  });

  // 3. Claim commits. Each branch walks its first-parent chain, taking every
  // unclaimed commit until it meets one already owned by a higher-priority
  // branch (typically the fork point).
  const branchByHash = new Map<string, string>();

  const claimChain = (start: string, branchName: string): void => {
    let current: string | undefined = start;

    while (current && parentsByHash.has(current) && !branchByHash.has(current)) {
      branchByHash.set(current, branchName);
      current = parentsByHash.get(current)?.[0];
    }
  };

  branchPriority.forEach((branch) => {
    claimChain(branch.tip, branch.name);
  });

  // 4. Merged-in history whose branch was deleted stays unclaimed after step 3.
  // Attribute it to the branch of the merge commit that pulled it in, walking
  // oldest-to-newest so a merge is already owned before we follow its parents.
  oldestFirst.forEach((commit) => {
    const owner = branchByHash.get(commit.hash);
    if (!owner || commit.parents.length < 2) {
      return;
    }

    commit.parents.slice(1).forEach((mergedInParent) => {
      claimChain(mergedInParent, owner);
    });
  });

  // 5. Anything still unclaimed (orphan/unreferenced commits) falls back to the
  // trunk-most branch, or the first branch if none is trunk-named.
  const fallbackBranch = branchPriority[0]?.name ?? head;
  rawCommits.forEach((commit) => {
    if (!branchByHash.has(commit.hash)) {
      branchByHash.set(commit.hash, fallbackBranch);
    }
  });

  // 6. Build the model. Lanes/colors are keyed off the claiming priority; the
  // renderer's `orderBranches` refines left-to-right placement from here.
  const colorByBranch = new Map<string, string>();
  const branches: BranchInfo[] = branchPriority.map((branch, index) => {
    const color = BRANCH_PALETTE[index % BRANCH_PALETTE.length] ?? DEFAULT_COLOR;
    colorByBranch.set(branch.name, color);

    return {
      name: branch.name,
      tip: branch.tip,
      lane: index,
      color,
    };
  });

  const commits: Commit[] = oldestFirst.map((commit) => {
    const branch = branchByHash.get(commit.hash) ?? fallbackBranch;

    return {
      hash: commit.hash,
      parents: [...commit.parents],
      branch,
      order: orderByHash.get(commit.hash) ?? 0,
    };
  });

  const model: GitModel = {
    commits,
    branches,
    // A detached HEAD has no owning branch, so mark none as current.
    head: head === 'HEAD' ? '' : head,
  };

  return model;
}

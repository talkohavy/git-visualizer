import type { Commit, GitModel } from '@root/common/types';

export function filterModelByBranches(props: { model: GitModel; selectedBranches: string[] }): GitModel {
  const { model, selectedBranches } = props;
  const selected = new Set(selectedBranches);

  const commitByHash = new Map<string, Commit>();

  model.commits.forEach((commit) => {
    commitByHash.set(commit.hash, commit);
  });

  const reachable = new Set<string>();
  const stack: string[] = [];

  model.branches.forEach((branch) => {
    if (selected.has(branch.name) && branch.tip) {
      stack.push(branch.tip);
    }
  });

  while (stack.length > 0) {
    const hash = stack.pop();

    if (hash === undefined || reachable.has(hash)) {
      continue;
    }

    reachable.add(hash);

    const commit = commitByHash.get(hash);

    if (!commit) {
      continue;
    }

    commit.parents.forEach((parent) => {
      if (!reachable.has(parent)) {
        stack.push(parent);
      }
    });
  }

  const filteredCommits: Commit[] = model.commits
    .filter((commit) => reachable.has(commit.hash))
    .sort((a, b) => a.order - b.order)
    .map((commit, index) => ({ ...commit, order: index }));

  const usedBranchNames = new Set(filteredCommits.map((commit) => commit.branch));
  const layoutBranches = model.branches.filter((branch) => usedBranchNames.has(branch.name));

  return { commits: filteredCommits, branches: layoutBranches, head: model.head };
}

import { BRANCH_PALETTE, DEFAULT_BRANCH, DEFAULT_COLOR } from './constants';
import { createHashGenerator } from './utils/createHashGenerator';
import type { BranchInfo, Commit, GitModel } from '@root/common/types';
import type { MutableBranch } from '../types';

export default class GitRepo {
  private readonly commits: Commit[] = [];
  private readonly branches = new Map<string, MutableBranch>();
  private readonly nextHash: () => string;
  private head: string = DEFAULT_BRANCH;
  private orderCounter = 0;
  private laneCounter = 0;

  constructor(props: { seed: string }) {
    const { seed } = props;
    this.nextHash = createHashGenerator({ seed });
    this.registerBranch(DEFAULT_BRANCH);
  }

  private registerBranch(name: string): MutableBranch {
    const lane = this.laneCounter++;
    const branch: MutableBranch = {
      name,
      tip: '',
      lane,
      color: BRANCH_PALETTE[lane % BRANCH_PALETTE.length] ?? DEFAULT_COLOR,
    };
    this.branches.set(name, branch);

    return branch;
  }

  private requireBranch(name: string): MutableBranch {
    const branch = this.branches.get(name);

    if (!branch) {
      throw new Error(`GitRepo: unknown branch "${name}". Create it with .branch() first.`);
    }

    return branch;
  }

  /**
   * Records a commit on the current branch (HEAD). Its parent is the branch tip.
   */
  commit(): this {
    const currentBranch = this.requireBranch(this.head);
    const parents = currentBranch.tip ? [currentBranch.tip] : [];
    const hash = this.nextHash();
    const commit: Commit = {
      hash,
      parents,
      branch: this.head,
      order: this.orderCounter++,
    };
    this.commits.push(commit);
    currentBranch.tip = hash;

    return this;
  }

  /**
   * Creates a new branch pointing at the current commit. Does NOT switch to it
   * (mirrors `git branch <name>`); call `.checkout()` to switch.
   */
  branch(name: string): this {
    if (this.branches.has(name)) {
      throw new Error(`GitRepo: branch "${name}" already exists.`);
    }

    const currentBranch = this.requireBranch(this.head);
    const newBranch = this.registerBranch(name);
    newBranch.tip = currentBranch.tip;

    return this;
  }

  /**
   * Switches HEAD to an existing branch.
   */
  checkout(name: string): this {
    this.requireBranch(name);
    this.head = name;

    return this;
  }

  /**
   * Convenience for `git checkout -b`: create a branch and switch to it.
   */
  branchAndCheckout(name: string): this {
    this.branch(name);
    this.checkout(name);

    return this;
  }

  /**
   * Merges `name` into the current branch, creating a merge commit with two
   * parents: the current tip and the tip of `name`.
   */
  merge(name: string): this {
    const currentBranch = this.requireBranch(this.head);
    const sourceBranch = this.requireBranch(name);

    if (!currentBranch.tip || !sourceBranch.tip) {
      throw new Error(`GitRepo: cannot merge "${name}" into "${this.head}" without commits on both branches.`);
    }

    const hash = this.nextHash();
    const commit: Commit = {
      hash,
      parents: [currentBranch.tip, sourceBranch.tip],
      branch: this.head,
      order: this.orderCounter++,
    };
    this.commits.push(commit);
    currentBranch.tip = hash;

    return this;
  }

  /**
   * Returns the tip hash of a branch (defaults to the current branch).
   */
  tipOf(name?: string): string {
    const branch = this.requireBranch(name ?? this.head);

    return branch.tip;
  }

  /**
   * Compiles the recorded history into a plain, immutable model for the layout.
   */
  build(): GitModel {
    const branchList: BranchInfo[] = Array.from(this.branches.values()).map((branch) => ({
      name: branch.name,
      tip: branch.tip,
      lane: branch.lane,
      color: branch.color,
    }));

    const model: GitModel = {
      commits: this.commits.map((commit) => ({ ...commit, parents: [...commit.parents] })),
      branches: branchList,
      head: this.head,
    };

    return model;
  }
}

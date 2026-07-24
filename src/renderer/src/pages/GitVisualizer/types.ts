export type Source = 'examples' | 'repo';

export type MutableBranch = {
  name: string;
  tip: string;
  lane: number;
  color: string;
};

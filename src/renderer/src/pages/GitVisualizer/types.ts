export type Source = 'examples' | 'repo';

export type MutableBranch = {
  name: string;
  tip: string;
  lane: number;
  color: string;
};

export type LayoutNode = {
  hash: string;
  prefix: string;
  cx: number;
  cy: number;
  color: string;
  branch: string;
  isMerge: boolean;
};

export type LayoutEdge = {
  id: string;
  path: string;
  color: string;
  /**
   * Topmost logical Y of the edge's vertical span (used for viewport culling).
   */
  minY: number;
  /**
   * Bottommost logical Y of the edge's vertical span (used for viewport culling).
   */
  maxY: number;
};

export type LayoutLabel = {
  name: string;
  x: number;
  y: number;
  color: string;
  isHead: boolean;
};

export type LayoutResult = {
  nodes: LayoutNode[];
  edges: LayoutEdge[];
  labels: LayoutLabel[];
  width: number;
  height: number;
};

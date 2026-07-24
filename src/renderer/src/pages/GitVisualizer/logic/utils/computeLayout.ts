import { NODE_RADIUS, PADDING, ROW_HEIGHT, LANE_WIDTH, LABEL_RESERVE } from '../constants';
import { orderBranches } from './orderBranches';
import type { GitModel } from '@root/common/types';
import type { LayoutEdge, LayoutLabel, LayoutNode, LayoutResult } from '../../types';

export function computeLayout(props: { model: GitModel; branchOrder?: string[] }) {
  const { model, branchOrder } = props;
  const { commits, branches, head } = model;

  const laneOrder = orderBranches({ model, override: branchOrder });
  const laneByBranch = new Map<string, number>();
  laneOrder.forEach((name, index) => {
    laneByBranch.set(name, index);
  });

  const colorByBranch = new Map<string, string>();
  branches.forEach((branch) => {
    colorByBranch.set(branch.name, branch.color);
  });

  const maxOrder = commits.length > 0 ? commits.length - 1 : 0;
  const maxLane = laneOrder.length > 0 ? laneOrder.length - 1 : 0;

  const positionByHash = new Map<string, { cx: number; cy: number }>();
  const nodes: LayoutNode[] = commits.map((commit) => {
    const lane = laneByBranch.get(commit.branch) ?? 0;
    const cx = centerX({ lane });
    const cy = centerY({ order: commit.order, maxOrder });
    positionByHash.set(commit.hash, { cx, cy });

    const node: LayoutNode = {
      hash: commit.hash,
      prefix: commit.hash.slice(0, 3),
      cx,
      cy,
      color: colorByBranch.get(commit.branch) ?? '#3b82f6',
      branch: commit.branch,
      isMerge: commit.parents.length > 1,
    };

    return node;
  });

  const edges: LayoutEdge[] = [];
  commits.forEach((commit) => {
    const childPosition = positionByHash.get(commit.hash);

    if (!childPosition) {
      return;
    }

    commit.parents.forEach((parentHash, parentIndex) => {
      const parentPosition = positionByHash.get(parentHash);

      if (!parentPosition) {
        return;
      }

      const isMergedInParent = commit.parents.length > 1 && parentIndex === 1;
      const parentCommit = commits.find((candidate) => candidate.hash === parentHash);
      const mergedInColor = parentCommit ? (colorByBranch.get(parentCommit.branch) ?? '#3b82f6') : '#3b82f6';
      const color = isMergedInParent ? mergedInColor : (colorByBranch.get(commit.branch) ?? '#3b82f6');

      const path = edgePath({
        fromX: parentPosition.cx,
        fromY: parentPosition.cy,
        toX: childPosition.cx,
        toY: childPosition.cy,
      });

      edges.push({ id: `${parentHash}-${commit.hash}`, path, color });
    });
  });

  const labels: LayoutLabel[] = [];
  branches.forEach((branch) => {
    if (!branch.tip) {
      return;
    }

    const tipPosition = positionByHash.get(branch.tip);

    if (!tipPosition) {
      return;
    }

    labels.push({
      name: branch.name,
      x: tipPosition.cx + NODE_RADIUS + 16,
      y: tipPosition.cy,
      color: branch.color,
      isHead: branch.name === head,
    });
  });

  const width = PADDING * 2 + NODE_RADIUS * 2 + maxLane * LANE_WIDTH + LABEL_RESERVE;
  const height = PADDING * 2 + NODE_RADIUS * 2 + maxOrder * ROW_HEIGHT;

  const result: LayoutResult = { nodes, edges, labels, width, height };

  return result;
}

function centerX(props: { lane: number }): number {
  const { lane } = props;
  const value = PADDING + NODE_RADIUS + lane * LANE_WIDTH;

  return value;
}

function centerY(props: { order: number; maxOrder: number }): number {
  const { order, maxOrder } = props;
  const value = PADDING + NODE_RADIUS + (maxOrder - order) * ROW_HEIGHT;

  return value;
}

/**
 * Builds a smooth S-shaped cubic Bezier from a parent (below) up to its child
 * (above). Control points sit at the vertical midpoint, so lane changes bow
 * outward with a pleasant, readable curvature.
 */
function edgePath(props: { fromX: number; fromY: number; toX: number; toY: number }): string {
  const { fromX, fromY, toX, toY } = props;
  const midY = (fromY + toY) / 2;
  const path = `M ${fromX} ${fromY} C ${fromX} ${midY}, ${toX} ${midY}, ${toX} ${toY}`;

  return path;
}

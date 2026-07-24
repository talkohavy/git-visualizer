import {
  NODE_RADIUS,
  PADDING,
  ROW_HEIGHT,
  LANE_WIDTH,
  LABEL_RESERVE,
  CHAR_WIDTH,
  HORIZONTAL_PADDING,
  LABEL_GAP,
} from '../constants';
import { orderBranches } from './orderBranches';
import type { GitModel } from '@root/common/types';
import type { LayoutEdge, LayoutLabel, LayoutNode, LayoutResult } from '../../types';

export function computeLayout(props: { model: GitModel; branchOrder?: string[] }) {
  const { model, branchOrder } = props;
  const { commits, branches, head } = model;

  const laneOrder = orderBranches({ model, override: branchOrder });
  const laneByBranch = assignLanes({ model, laneOrder });

  const colorByBranch = new Map<string, string>();
  branches.forEach((branch) => {
    colorByBranch.set(branch.name, branch.color);
  });

  const maxOrder = commits.length > 0 ? commits.length - 1 : 0;
  let maxLane = 0;

  laneByBranch.forEach((lane) => {
    if (lane > maxLane) {
      maxLane = lane;
    }
  });

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

      const minY = Math.min(parentPosition.cy, childPosition.cy);
      const maxY = Math.max(parentPosition.cy, childPosition.cy);

      edges.push({ id: `${parentHash}-${commit.hash}`, path, color, minY, maxY });
    });
  });

  const pillWidth = (name: string): number => {
    const text = name === head ? `* ${name}` : name;

    return text.length * CHAR_WIDTH + HORIZONTAL_PADDING * 2;
  };

  const labels: LayoutLabel[] = [];
  // Multiple branches can point at the same commit (e.g. a local branch and its
  // remote-tracking counterpart). Stack their pills horizontally so they don't
  // render on top of each other.
  const offsetByTip = new Map<string, number>();
  let maxLabelRight = 0;
  branches.forEach((branch) => {
    if (!branch.tip) {
      return;
    }

    const tipPosition = positionByHash.get(branch.tip);

    if (!tipPosition) {
      return;
    }

    const offset = offsetByTip.get(branch.tip) ?? 0;
    const x = tipPosition.cx + NODE_RADIUS + 16 + offset;
    offsetByTip.set(branch.tip, offset + pillWidth(branch.name) + LABEL_GAP);

    labels.push({
      name: branch.name,
      x,
      y: tipPosition.cy,
      color: branch.color,
      isHead: branch.name === head,
    });

    const rightEdge = x + pillWidth(branch.name);
    if (rightEdge > maxLabelRight) {
      maxLabelRight = rightEdge;
    }
  });

  // Reserve enough room on the right so the longest (possibly stacked) label
  // isn't clipped by the SVG viewBox; fall back to LABEL_RESERVE when there are
  // no labels.
  const laneRight = PADDING + NODE_RADIUS + maxLane * LANE_WIDTH;
  const labelReserve = Math.max(LABEL_RESERVE, maxLabelRight - laneRight + PADDING);
  const width = PADDING * 2 + NODE_RADIUS * 2 + maxLane * LANE_WIDTH + labelReserve;
  const height = PADDING * 2 + NODE_RADIUS * 2 + maxOrder * ROW_HEIGHT;

  const result: LayoutResult = { nodes, edges, labels, width, height };

  return result;
}

/**
 * Packs branches into lanes instead of giving every branch its own column.
 *
 * Each branch occupies a vertical interval `[fork, merge]`: from the order of
 * the commit it forked off, up to the order of the commit that merges it back
 * (or its own tip / the point a child departs from it, whichever is latest).
 * We then greedily colour these intervals - walking branches in `laneOrder`
 * (the crossing-minimizing priority) and assigning each the smallest lane whose
 * current occupants don't overlap it.
 *
 * Consequence: `main` spans the whole history, so it keeps lane 0 and forces
 * every side branch to lane >= 1. Two side branches that both fork from `main`
 * both land on lane 1 - they only get bumped to lane 2, 3, ... when their
 * vertical intervals actually collide. Branches that merely touch at a shared
 * trunk commit (one merges in where the next forks off) do NOT collide.
 */
function assignLanes(props: { model: GitModel; laneOrder: string[] }): Map<string, number> {
  const { model, laneOrder } = props;
  const { commits } = model;

  const orderByHash = new Map<string, number>();
  const branchByHash = new Map<string, string>();
  commits.forEach((commit) => {
    orderByHash.set(commit.hash, commit.order);
    branchByHash.set(commit.hash, commit.branch);
  });

  const ownMin = new Map<string, number>();
  const ownMax = new Map<string, number>();
  const forkParentHash = new Map<string, string | undefined>();

  commits.forEach((commit) => {
    const currentMin = ownMin.get(commit.branch);
    if (currentMin === undefined || commit.order < currentMin) {
      ownMin.set(commit.branch, commit.order);
      forkParentHash.set(commit.branch, commit.parents[0]);
    }

    const currentMax = ownMax.get(commit.branch);
    if (currentMax === undefined || commit.order > currentMax) {
      ownMax.set(commit.branch, commit.order);
    }
  });

  const start = new Map<string, number>();
  const end = new Map<string, number>();

  laneOrder.forEach((name) => {
    const min = ownMin.get(name) ?? 0;
    const max = ownMax.get(name) ?? 0;
    const parentHash = forkParentHash.get(name);
    const parentOrder = parentHash ? orderByHash.get(parentHash) : undefined;

    start.set(name, parentOrder !== undefined && parentOrder < min ? parentOrder : min);
    end.set(name, max);
  });

  // A commit on another branch that points back to this branch (a merge, or a
  // child forking off it) keeps this lane busy until that later commit.
  commits.forEach((commit) => {
    commit.parents.forEach((parentHash) => {
      const parentBranch = branchByHash.get(parentHash);

      if (parentBranch && parentBranch !== commit.branch) {
        const currentEnd = end.get(parentBranch);

        if (currentEnd === undefined || commit.order > currentEnd) {
          end.set(parentBranch, commit.order);
        }
      }
    });
  });

  const laneByBranch = new Map<string, number>();
  const lanes: { start: number; end: number }[][] = [];

  laneOrder.forEach((name) => {
    const from = start.get(name) ?? 0;
    const to = end.get(name) ?? 0;

    let chosen = lanes.findIndex((occupants) => {
      const collides = occupants.some((interval) => from < interval.end && interval.start < to);

      return !collides;
    });

    if (chosen === -1) {
      chosen = lanes.length;
      lanes.push([]);
    }

    const occupants = lanes[chosen] ?? [];
    occupants.push({ start: from, end: to });
    lanes[chosen] = occupants;
    laneByBranch.set(name, chosen);
  });

  return laneByBranch;
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

export const HEX_CHARS = '0123456789abcdef';
export const HASH_LENGTH = 40;
export const PREFIX_LENGTH = 3;

export const BRANCH_PALETTE = [
  '#3b82f6', // blue   (main)
  '#22c55e', // green
  '#f59e0b', // amber
  '#ec4899', // pink
  '#8b5cf6', // violet
  '#14b8a6', // teal
  '#ef4444', // red
  '#eab308', // yellow
];

export const DEFAULT_BRANCH = 'main';
export const DEFAULT_COLOR = '#3b82f6';

/**
 * Node circle radius in px. Diameter (64px) satisfies the "at least 60px" goal.
 */
export const NODE_RADIUS = 32;
/**
 * Vertical distance between two successive commits. Kept large so arches are
 * long and side branches read as clearly separate from their parent.
 */
export const ROW_HEIGHT = 140;
/**
 * Horizontal distance between branch lanes. Generous so a side branch sits far
 * from the branch it was created from.
 */
export const LANE_WIDTH = 210;
/**
 * Outer padding around the whole graph.
 */
export const PADDING = 90;
/**
 * Extra room on the right for branch labels.
 */
export const LABEL_RESERVE = 220;

export const CHAR_WIDTH = 9;
export const HORIZONTAL_PADDING = 14;
export const PILL_HEIGHT = 34;

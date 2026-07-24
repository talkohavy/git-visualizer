import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { OVERSCAN } from '../../logic/constants';
import { computeLayout } from '../../logic/utils/computeLayout';
import Arch from '../Arch';
import BranchLabel from '../BranchLabel';
import CommitNode from '../CommitNode';
import type { GitModel } from '@root/common/types';

type GitGraphProps = {
  model: GitModel;
  branchOrder?: string[];
  onCommitClick?: (hash: string) => void;
  /**
   * Vertical scroll offset of the surrounding scroll container, in displayed px.
   */
  scrollTop?: number;
  /** Height of the visible viewport, in displayed px. */
  viewportHeight?: number;
};

/**
 * Renders the SVG at a fraction of its intrinsic size (viewBox stays full-size),
 * so the whole graph — nodes, text, strokes and spacing — scales down uniformly.
 */
const SCALE = 0.6;

export default function GitGraph(props: GitGraphProps) {
  const { model, branchOrder, onCommitClick, scrollTop = 0, viewportHeight = 0 } = props;

  const svgRef = useRef<SVGSVGElement>(null);
  const [svgOffsetTop, setSvgOffsetTop] = useState(0);

  const layout = useMemo(() => computeLayout({ model, branchOrder }), [model, branchOrder]);

  useLayoutEffect(() => {
    const element = svgRef.current as unknown as HTMLElement | null;
    setSvgOffsetTop(element?.offsetTop ?? 0);
  }, [layout.height]);

  const logicalTop = (scrollTop - svgOffsetTop) / SCALE;
  const logicalBottom = (scrollTop - svgOffsetTop + viewportHeight) / SCALE;

  const windowTop = Math.floor((logicalTop - OVERSCAN) / OVERSCAN) * OVERSCAN;
  const windowBottom = Math.ceil((logicalBottom + OVERSCAN) / OVERSCAN) * OVERSCAN;

  const visible = useMemo(() => {
    const nodes = layout.nodes.filter((node) => node.cy >= windowTop && node.cy <= windowBottom);
    const labels = layout.labels.filter((label) => label.y >= windowTop && label.y <= windowBottom);
    const edges = layout.edges.filter((edge) => edge.maxY >= windowTop && edge.minY <= windowBottom);

    return { nodes, labels, edges };
  }, [layout, windowTop, windowBottom]);

  return (
    <svg
      ref={svgRef}
      width={layout.width * SCALE}
      height={layout.height * SCALE}
      viewBox={`0 0 ${layout.width} ${layout.height}`}
      className='block'
      role='img'
      aria-label='Git commit graph'
    >
      <g>
        {visible.edges.map((edge) => (
          <Arch key={edge.id} edge={edge} />
        ))}
      </g>
      <g>
        {visible.nodes.map((node) => (
          <CommitNode key={node.hash} node={node} onClick={onCommitClick} />
        ))}
      </g>
      <g>
        {visible.labels.map((label) => (
          <BranchLabel key={label.name} label={label} />
        ))}
      </g>
    </svg>
  );
}

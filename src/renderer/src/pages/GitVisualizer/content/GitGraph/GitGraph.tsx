import { useMemo } from 'react';
import { computeLayout } from '../../logic/utils/computeLayout';
import Arch from '../Arch';
import BranchLabel from '../BranchLabel';
import CommitNode from '../CommitNode';
import type { GitModel } from '@root/common/types';

type GitGraphProps = {
  model: GitModel;
  branchOrder?: string[];
  onCommitClick?: (hash: string) => void;
};

export default function GitGraph(props: GitGraphProps) {
  const { model, branchOrder, onCommitClick } = props;

  const layout = useMemo(() => computeLayout({ model, branchOrder }), [model, branchOrder]);

  return (
    <svg
      width={layout.width}
      height={layout.height}
      viewBox={`0 0 ${layout.width} ${layout.height}`}
      className='block'
      role='img'
      aria-label='Git commit graph'
    >
      <g>
        {layout.edges.map((edge) => (
          <Arch key={edge.id} edge={edge} />
        ))}
      </g>
      <g>
        {layout.nodes.map((node) => (
          <CommitNode key={node.hash} node={node} onClick={onCommitClick} />
        ))}
      </g>
      <g>
        {layout.labels.map((label) => (
          <BranchLabel key={label.name} label={label} />
        ))}
      </g>
    </svg>
  );
}

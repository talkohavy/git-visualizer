import { NODE_RADIUS } from '../../logic/constants';
import type { LayoutNode } from '../../types';

type CommitNodeProps = {
  node: LayoutNode;
  onClick?: (hash: string) => void;
};

export default function CommitNode(props: CommitNodeProps) {
  const { node, onClick } = props;

  function handleClick() {
    onClick?.(node.hash);
  }

  return (
    <g
      transform={`translate(${node.cx}, ${node.cy})`}
      onClick={handleClick}
      className='cursor-pointer [&:hover>circle]:opacity-80'
    >
      <title>{node.hash}</title>

      <circle r={NODE_RADIUS} className='fill-white dark:fill-gray-900' stroke={node.color} strokeWidth={6} />

      {node.isMerge && (
        <circle r={NODE_RADIUS - 9} fill='none' stroke={node.color} strokeWidth={2.5} className='opacity-50' />
      )}

      <text
        textAnchor='middle'
        dominantBaseline='central'
        fontSize={19}
        fill={node.color}
        className='font-mono font-bold select-none'
      >
        {node.prefix}
      </text>
    </g>
  );
}

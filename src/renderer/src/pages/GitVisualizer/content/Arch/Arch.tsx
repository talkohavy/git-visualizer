import type { LayoutEdge } from '../../types';

export type ArchProps = {
  edge: LayoutEdge;
};

export default function Arch(props: ArchProps) {
  const { edge } = props;

  return (
    <path d={edge.path} fill='none' stroke={edge.color} strokeWidth={4} strokeLinecap='round' className='opacity-80' />
  );
}

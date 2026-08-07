import { useState } from 'react';

type BranchOrderControlsProps = {
  order: string[];
  colorByBranch: Record<string, string>;
  isCustom: boolean;
  onMove: (props: { index: number; direction: -1 | 1 }) => void;
  onReset: () => void;
};

export default function BranchOrderControls(props: BranchOrderControlsProps) {
  const { order, colorByBranch, isCustom, onMove, onReset } = props;
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className='flex flex-wrap items-center gap-3'>
      <button
        type='button'
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        aria-label={isOpen ? 'Collapse lane order' : 'Expand lane order'}
        className='flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800'
      >
        <span>Lane order</span>
        <span className='text-xs opacity-60'>{isOpen ? '\u25B2' : '\u25BC'}</span>
      </button>

      {isOpen && (
        <>
          <div className='flex flex-wrap items-center gap-2'>
            {order.map((name, index) => {
              const color = colorByBranch[name] ?? '#3b82f6';
              const isFirst = index === 0;
              const isLast = index === order.length - 1;

              return (
                <div
                  key={name}
                  className='flex items-center gap-1 rounded-full py-1 pr-1 pl-3 text-white shadow-sm'
                  style={{ backgroundColor: color }}
                >
                  <span className='font-mono text-sm font-bold'>{name}</span>
                  <button
                    type='button'
                    aria-label={`Move ${name} left`}
                    disabled={isFirst}
                    onClick={() => onMove({ index, direction: -1 })}
                    className='flex size-6 items-center justify-center rounded-full bg-black/20 text-xs leading-none hover:bg-black/40 disabled:cursor-not-allowed disabled:opacity-30'
                  >
                    {'\u25C0'}
                  </button>
                  <button
                    type='button'
                    aria-label={`Move ${name} right`}
                    disabled={isLast}
                    onClick={() => onMove({ index, direction: 1 })}
                    className='flex size-6 items-center justify-center rounded-full bg-black/20 text-xs leading-none hover:bg-black/40 disabled:cursor-not-allowed disabled:opacity-30'
                  >
                    {'\u25B6'}
                  </button>
                </div>
              );
            })}
          </div>

          <button
            type='button'
            onClick={onReset}
            disabled={!isCustom}
            className='rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800'
          >
            Auto
          </button>
        </>
      )}
    </div>
  );
}

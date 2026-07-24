import { useEffect, useMemo, useRef, useState } from 'react';

type BranchOption = {
  name: string;
  color: string;
};

type BranchFilterProps = {
  branches: BranchOption[];
  selected: string[];
  onToggle: (name: string) => void;
  onSelectAll: () => void;
  onClear: () => void;
};

export default function BranchFilter(props: BranchFilterProps) {
  const { branches, selected, onToggle, onSelectAll, onClear } = props;

  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedSet = useMemo(() => new Set(selected), [selected]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();

    if (!needle) {
      return branches;
    }

    return branches.filter((branch) => branch.name.toLowerCase().includes(needle));
  }, [branches, query]);

  useEffect(() => {
    if (!isOpen) return;

    function onPointerDown(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', onPointerDown);

    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [isOpen]);

  if (branches.length === 0) return null;

  const summary =
    selected.length === branches.length ? 'All branches' : `${selected.length} of ${branches.length} branches`;

  return (
    <div ref={containerRef} className='relative flex items-center gap-3'>
      <span className='text-sm font-medium text-gray-600 dark:text-gray-300'>Branches</span>

      <button
        type='button'
        onClick={() => setIsOpen((open) => !open)}
        aria-haspopup='listbox'
        aria-expanded={isOpen}
        className='flex min-w-48 items-center justify-between gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800'
      >
        <span className='truncate'>{summary}</span>
        <span className='text-xs opacity-60'>{isOpen ? '\u25B2' : '\u25BC'}</span>
      </button>

      {isOpen && (
        <div className='absolute top-full left-0 z-20 mt-2 w-72 rounded-xl border border-gray-200 bg-white p-3 shadow-xl dark:border-gray-700 dark:bg-gray-900'>
          <div className='mb-2 flex items-center gap-2'>
            <button
              type='button'
              onClick={onSelectAll}
              className='rounded-md border border-gray-300 px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800'
            >
              Select all
            </button>
            <button
              type='button'
              onClick={onClear}
              className='rounded-md border border-gray-300 px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800'
            >
              Clear all
            </button>
          </div>

          <input
            type='text'
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder='Search branches…'
            className='mb-2 w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100'
          />

          <ul className='max-h-64 overflow-auto'>
            {filtered.length === 0 ? (
              <li className='px-1 py-2 text-sm text-gray-500 dark:text-gray-400'>No matching branches</li>
            ) : (
              filtered.map((branch) => (
                <li key={branch.name}>
                  <label className='flex cursor-pointer items-center gap-2 rounded-md px-1 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-800'>
                    <input
                      type='checkbox'
                      checked={selectedSet.has(branch.name)}
                      onChange={() => onToggle(branch.name)}
                      className='size-4 accent-blue-600'
                    />
                    <span
                      className='size-3 shrink-0 rounded-full'
                      style={{ backgroundColor: branch.color }}
                      aria-hidden
                    />
                    <span className='truncate font-mono text-sm text-gray-800 dark:text-gray-100'>{branch.name}</span>
                  </label>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

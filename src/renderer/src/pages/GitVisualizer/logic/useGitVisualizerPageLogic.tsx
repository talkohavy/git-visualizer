import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useDragToScroll } from '@renderer/hooks/useDragToScroll';
import { useIsCloseToEdge } from '@renderer/hooks/useIsCloseToEdge';
import { useScrollToEdge } from '@renderer/hooks/useScrollToEdge';
import { ipcClient } from '@renderer/lib/ipc';
import GitGraph from '../content/GitGraph';
import { EXAMPLES, type Example } from '../examples/examples';
import { filterModelByBranches } from './utils/filterModelByBranches';
import { orderBranches } from './utils/orderBranches';
import type { SelectOption } from '@renderer/components/controls/Select';
import type { BranchInfo, GitModel } from '@root/common/types';
import type { Source } from '../types';

export function useGitVisualizerPageLogic() {
  const [selectedId, setSelectedId] = useState(EXAMPLES[0]?.id ?? '');
  const [order, setOrder] = useState<string[]>([]);
  const [isCustom, setIsCustom] = useState(false);
  const [selectedBranches, setSelectedBranches] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [scrollTop, setScrollTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(0);
  const rafRef = useRef<number | null>(null);

  const readScrollMetrics = useCallback(() => {
    const element = scrollRef.current;

    if (!element) {
      return;
    }

    setScrollTop(element.scrollTop);
    setViewportHeight(element.clientHeight);
  }, []);

  const onScrollMetrics = useCallback(() => {
    if (rafRef.current !== null) {
      return;
    }

    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      readScrollMetrics();
    });
  }, [readScrollMetrics]);

  useEffect(() => {
    const element = scrollRef.current;

    if (!element) {
      return;
    }

    readScrollMetrics();

    const observer = new ResizeObserver(() => readScrollMetrics());
    observer.observe(element);

    return () => {
      observer.disconnect();

      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [readScrollMetrics]);

  const { isCloseToEdge: isCloseToBottom, onScroll: onScrollToBottom } = useIsCloseToEdge({ to: 'bottom' });
  const { scrollToEdge: scrollToBottom } = useScrollToEdge({ refElement: scrollRef, to: 'bottom' });

  const { isCloseToEdge: isCloseToTop, onScroll: onScrollToTop } = useIsCloseToEdge({
    to: 'top',
    initialIsCloseToEdge: true,
  });
  const { scrollToEdge: scrollToTop } = useScrollToEdge({ refElement: scrollRef, to: 'top' });

  const { isDragging, dragHandlers } = useDragToScroll({ refElement: scrollRef });

  const [source, setSource] = useState<Source>('examples');
  const [repoModel, setRepoModel] = useState<GitModel | null>(null);
  const [repoPath, setRepoPath] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const options = useMemo<SelectOption[]>(
    () => EXAMPLES.map((example) => ({ value: example.id, label: example.label })),
    [],
  );

  const selectedExample = useMemo<Example>(
    () => EXAMPLES.find((example) => example.id === selectedId) ?? EXAMPLES[0]!,
    [selectedId],
  );

  const selectedOption = useMemo<SelectOption>(
    () => ({ value: selectedExample?.id ?? '', label: selectedExample?.label ?? '' }),
    [selectedExample],
  );

  const showingRepo = source === 'repo' && repoModel !== null;
  const activeModel = showingRepo ? repoModel : (selectedExample?.model ?? null);

  const autoOrder = useMemo(() => (activeModel ? orderBranches({ model: activeModel }) : []), [activeModel]);

  const colorByBranch = useMemo(() => {
    const map: Record<string, string> = {};

    activeModel?.branches.forEach((branch: BranchInfo) => {
      map[branch.name] = branch.color;
    });

    return map;
  }, [activeModel]);

  useEffect(() => {
    const override = showingRepo ? undefined : selectedExample?.branchOrder;
    setOrder(override ?? autoOrder);
    setIsCustom(Boolean(override));
  }, [activeModel, autoOrder, showingRepo, selectedExample]);

  const branchOptions = useMemo(
    () => (activeModel?.branches ?? []).map((branch) => ({ name: branch.name, color: branch.color })),
    [activeModel],
  );

  useEffect(() => {
    setSelectedBranches(activeModel ? activeModel.branches.map((branch) => branch.name) : []);
  }, [activeModel]);

  const selectedBranchSet = useMemo(() => new Set(selectedBranches), [selectedBranches]);

  const filteredModel = useMemo(
    () => (activeModel ? filterModelByBranches({ model: activeModel, selectedBranches }) : null),
    [activeModel, selectedBranches],
  );

  const handleToggleBranch = useCallback((name: string) => {
    setSelectedBranches((current) =>
      current.includes(name) ? current.filter((branch) => branch !== name) : [...current, name],
    );
  }, []);

  const handleSelectAllBranches = useCallback(() => {
    setSelectedBranches(branchOptions.map((branch) => branch.name));
  }, [branchOptions]);

  const handleClearBranches = useCallback(() => {
    setSelectedBranches([]);
  }, []);

  function handleSelect(option: SelectOption) {
    setSelectedId(option.value.toString());
    setSource('examples');
  }

  const handleOpenRepo = useCallback(async () => {
    setLoadError(null);

    const path = await ipcClient.dialog.selectFolder();

    if (!path) {
      return;
    }

    setIsLoading(true);

    try {
      const result = await ipcClient.git.getGraph(path);

      if (result.ok) {
        setRepoModel(result.model);
        setRepoPath(path);
        setSource('repo');
      } else {
        setRepoModel(null);
        setRepoPath(path);
        setSource('repo');
        setLoadError(result.message);
      }
    } catch (error) {
      setRepoModel(null);
      setRepoPath(path);
      setSource('repo');
      setLoadError(error instanceof Error ? error.message : 'Failed to read the repository.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleShowExamples = useCallback(() => {
    setSource('examples');
    setLoadError(null);
  }, []);

  function handleMove({ index, direction }: { index: number; direction: -1 | 1 }) {
    const target = index + direction;

    if (target < 0 || target >= order.length) {
      return;
    }

    const nextOrder = [...order];
    const moved = nextOrder[index];
    const swapped = nextOrder[target];

    if (moved === undefined || swapped === undefined) {
      return;
    }

    nextOrder[index] = swapped;
    nextOrder[target] = moved;
    setOrder(nextOrder);
    setIsCustom(true);
  }

  function handleReset() {
    setOrder(autoOrder);
    setIsCustom(false);
  }

  useEffect(() => {
    const folderName = showingRepo && repoPath ? repoPath.split(/[\\/]/).filter(Boolean).pop() : null;
    document.title = folderName ? folderName : 'Git Visualizer';
  }, [showingRepo, repoPath]);

  const headerDescription = showingRepo ? (repoPath ?? 'Loaded repository') : (selectedExample?.description ?? '');

  const showRepoError = Boolean(loadError) && source === 'repo';

  let graphArea: ReactNode = null;
  if (showRepoError) {
    graphArea = (
      <div className='mx-auto max-w-md rounded-xl border border-amber-300 bg-amber-50 p-6 text-center dark:border-amber-700 dark:bg-amber-950'>
        <p className='text-sm font-medium text-amber-800 dark:text-amber-200'>{loadError}</p>
        <button
          type='button'
          onClick={handleShowExamples}
          className='mt-4 rounded-lg border border-amber-400 px-3 py-1.5 text-sm font-medium text-amber-800 hover:bg-amber-100 dark:border-amber-600 dark:text-amber-200 dark:hover:bg-amber-900'
        >
          Back to examples
        </button>
      </div>
    );
  } else if (activeModel && selectedBranches.length === 0) {
    graphArea = (
      <div className='mx-auto max-w-md rounded-xl border border-gray-300 bg-white p-6 text-center dark:border-gray-700 dark:bg-gray-900'>
        <p className='text-sm font-medium text-gray-700 dark:text-gray-200'>No branches selected</p>

        <button
          type='button'
          onClick={handleSelectAllBranches}
          className='mt-4 rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800'
        >
          Show all branches
        </button>
      </div>
    );
  } else if (filteredModel) {
    graphArea = (
      <GitGraph
        model={filteredModel}
        branchOrder={order}
        labelBranches={selectedBranchSet}
        scrollTop={scrollTop}
        viewportHeight={viewportHeight}
      />
    );
  }

  return {
    headerDescription,
    selectedOption,
    options,
    handleSelect,
    handleOpenRepo,
    handleShowExamples,
    handleMove,
    handleReset,
    isLoading,
    repoModel,
    showingRepo,
    setSource,
    order,
    colorByBranch,
    isCustom,
    branchOptions,
    selectedBranches,
    handleToggleBranch,
    handleSelectAllBranches,
    handleClearBranches,
    scrollRef,
    isDragging,
    dragHandlers,
    graphArea,
    isCloseToBottom,
    isCloseToTop,
    onScrollToBottom,
    onScrollToTop,
    onScrollMetrics,
    scrollToBottom,
    scrollToTop,
  };
}

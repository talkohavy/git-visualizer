import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { ipcClient } from '@renderer/lib/ipc';
import GitGraph from '../content/GitGraph';
import { EXAMPLES } from '../examples/examples';
import { orderBranches } from '../logic/laneOrder';
import type { SelectOption } from '@renderer/components/controls/Select';
import type { GitModel } from '../logic/types';
import type { Source } from '../types';

export function useGitVisualizerPageLogic() {
  const [selectedId, setSelectedId] = useState(EXAMPLES[0]?.id ?? '');
  const [order, setOrder] = useState<string[]>([]);
  const [isCustom, setIsCustom] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [source, setSource] = useState<Source>('examples');
  const [repoModel, setRepoModel] = useState<GitModel | null>(null);
  const [repoPath, setRepoPath] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const options = useMemo<SelectOption[]>(
    () => EXAMPLES.map((example) => ({ value: example.id, label: example.label })),
    [],
  );

  const selectedExample = useMemo(
    () => EXAMPLES.find((example) => example.id === selectedId) ?? EXAMPLES[0],
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

    activeModel?.branches.forEach((branch) => {
      map[branch.name] = branch.color;
    });

    return map;
  }, [activeModel]);

  // Reset the lane order whenever the active model changes: examples may carry a
  // manual override; real repos always start from the automatic order.
  useEffect(() => {
    const override = showingRepo ? undefined : selectedExample?.branchOrder;
    setOrder(override ?? autoOrder);
    setIsCustom(Boolean(override));
  }, [activeModel, autoOrder, showingRepo, selectedExample]);

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
  } else if (activeModel) {
    graphArea = <GitGraph model={activeModel} branchOrder={order} />;
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
    scrollRef,
    graphArea,
  };
}

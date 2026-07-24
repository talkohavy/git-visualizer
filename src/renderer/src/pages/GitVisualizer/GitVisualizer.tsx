import Select from '@renderer/components/controls/Select';
import BranchOrderControls from './content/BranchOrderControls';
import { useGitVisualizerPageLogic } from './logic/useGitVisualizerPageLogic';

export default function GitVisualizerPage() {
  const {
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
  } = useGitVisualizerPageLogic();

  return (
    <div className='size-full flex flex-col bg-gray-50 dark:bg-gray-950'>
      <header className='flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-800 px-8 py-5'>
        <div className='flex flex-col gap-1'>
          <h1 className='text-2xl font-bold text-gray-800 dark:text-gray-100'>Git Visualizer</h1>
          <p className='text-sm text-gray-500 dark:text-gray-400 truncate max-w-2xl'>{headerDescription}</p>
        </div>
        <div className='flex items-center gap-3'>
          <span className='text-sm font-medium text-gray-600 dark:text-gray-300'>Example</span>
          <Select
            selectedOption={selectedOption}
            setSelectedOption={handleSelect}
            options={options}
            ariaLabel='Choose a git example'
            className='min-w-56'
          />
          <button
            type='button'
            onClick={handleOpenRepo}
            disabled={isLoading}
            className='rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50'
          >
            {isLoading ? 'Loading…' : 'Open repo'}
          </button>
          {repoModel && !showingRepo && (
            <button
              type='button'
              onClick={() => setSource('repo')}
              className='rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800'
            >
              Show repo
            </button>
          )}
          {showingRepo && (
            <button
              type='button'
              onClick={handleShowExamples}
              className='rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800'
            >
              Show examples
            </button>
          )}
        </div>
      </header>

      <div className='border-b border-gray-200 dark:border-gray-800 px-8 py-4'>
        <BranchOrderControls
          order={order}
          colorByBranch={colorByBranch}
          isCustom={isCustom}
          onMove={handleMove}
          onReset={handleReset}
        />
      </div>

      <div ref={scrollRef} className='flex-1 overflow-auto p-10'>
        {graphArea}
      </div>
    </div>
  );
}

import Select from '@renderer/components/controls/Select';
import DownArrow from '@renderer/components/svgs/DownArrow';
import clsx from 'clsx';
import BranchOrderControls from './content/BranchOrderControls';
import { useGitVisualizerPageLogic } from './logic/useGitVisualizerPageLogic';

const showLaneControls = false;

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
        {showLaneControls ? (
          <BranchOrderControls
            order={order}
            colorByBranch={colorByBranch}
            isCustom={isCustom}
            onMove={handleMove}
            onReset={handleReset}
          />
        ) : null}
      </div>

      <div
        ref={scrollRef}
        onScroll={(e) => {
          onScrollToBottom(e);
          onScrollToTop(e);
          onScrollMetrics();
        }}
        {...dragHandlers}
        className={clsx(
          'relative flex-1 overflow-auto p-10 select-none',
          isDragging ? 'cursor-grabbing' : 'cursor-grab',
        )}
      >
        {graphArea}

        {!isCloseToBottom && (
          <button
            type='button'
            onClick={scrollToBottom}
            aria-label='Scroll to bottom'
            title='Scroll to bottom'
            className='fixed bottom-10 right-24 z-10 flex size-12 cursor-pointer items-center justify-center rounded-full border border-gray-300 bg-white text-gray-700 shadow-lg hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700'
          >
            <DownArrow className='size-4' />
          </button>
        )}

        {!isCloseToTop && (
          <button
            type='button'
            onClick={scrollToTop}
            aria-label='Scroll to top'
            title='Scroll to top'
            className='fixed bottom-10 right-10 z-10 flex size-12 cursor-pointer items-center justify-center rounded-full border border-gray-300 bg-white text-gray-700 shadow-lg hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700'
          >
            <DownArrow className='size-4 rotate-180' />
          </button>
        )}
      </div>
    </div>
  );
}

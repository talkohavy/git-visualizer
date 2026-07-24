import { useCallback, useEffect, useState } from 'react';
import { useIpcEvent } from '@renderer/hooks/useIpcEvent';
import { ipcClient } from '@renderer/lib/ipc';
import Panel from '../Panel';

export default function CounterPanel(): React.JSX.Element {
  const [count, setCount] = useState(0);

  useEffect(() => {
    ipcClient.counter.get().then(setCount);
  }, []);

  useIpcEvent(ipcClient.counter.onChanged, setCount);

  const onIncrementBy1Click = useCallback(() => {
    ipcClient.counter.increment(1);
  }, []);

  const onIncrementBy5Click = useCallback(() => {
    ipcClient.counter.increment(5);
  }, []);

  return (
    <Panel title='counter' pattern='invoke + send + push event'>
      <p className='font-mono text-4xl font-extrabold text-gray-900 dark:text-white'>{count}</p>

      <div className='flex gap-2'>
        <button
          type='button'
          onClick={onIncrementBy1Click}
          className='w-fit cursor-pointer rounded-full bg-blue-500 px-4 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-blue-600'
        >
          +1
        </button>

        <button
          type='button'
          onClick={onIncrementBy5Click}
          className='w-fit cursor-pointer rounded-full bg-blue-500 px-4 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-blue-600'
        >
          +5
        </button>
      </div>
    </Panel>
  );
}

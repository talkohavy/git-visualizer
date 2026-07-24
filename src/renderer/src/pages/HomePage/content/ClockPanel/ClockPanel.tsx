import { useState } from 'react';
import { useIpcEvent } from '@renderer/hooks/useIpcEvent';
import { ipcClient } from '@root/renderer/src/lib/ipc';
import Panel from '../Panel';

export default function ClockPanel(): React.JSX.Element {
  const [running, setRunning] = useState(false);
  const [lastTick, setLastTick] = useState<number | null>(null);

  useIpcEvent(ipcClient.clock.onTick, (val: any) => {
    setLastTick(val);
  });

  const toggleStartStopTicking = (): void => {
    const next = !running;

    setRunning(next);

    ipcClient.clock.setRunning(next);
  };

  const formattedLastTick = lastTick ? new Date(lastTick).toLocaleTimeString() : '(no ticks yet)';

  return (
    <Panel title='clock' pattern='send + push event (heartbeat)'>
      <button
        type='button'
        onClick={toggleStartStopTicking}
        className='w-fit cursor-pointer rounded-full bg-blue-500 px-4 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-blue-600'
      >
        {running ? 'Stop' : 'Start'} ticking
      </button>

      <p className='font-mono text-sm text-gray-500 dark:text-gray-400'>{formattedLastTick}</p>
    </Panel>
  );
}

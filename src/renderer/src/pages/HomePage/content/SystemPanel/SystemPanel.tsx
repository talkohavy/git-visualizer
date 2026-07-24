import { useCallback, useState } from 'react';
import { ipcClient } from '@renderer/lib/ipc';
import Panel from '../Panel';
import type { SystemInfo } from '@root/common/types';

export default function SystemPanel(): React.JSX.Element {
  const [info, setInfo] = useState<SystemInfo | null>(null);

  const onLoadSystemInfoClick = useCallback(async () => {
    const info = await ipcClient.system.getInfo();

    setInfo(info);
  }, []);

  const formattedUptime = info ? Math.round(info.uptimeMs / 1000) : 0;

  return (
    <Panel title='system.getInfo()' pattern='invoke - request/response'>
      <button
        type='button'
        onClick={onLoadSystemInfoClick}
        className='w-fit cursor-pointer rounded-full bg-blue-500 px-4 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-blue-600'
      >
        Load system info
      </button>

      {info && (
        <ul className='list-none text-sm leading-6 text-gray-500 dark:text-gray-400'>
          <li>
            {info.platform} / {info.arch}
          </li>

          <li>Electron v{info.versions.electron}</li>

          <li>Node v{info.versions.node}</li>

          <li>Uptime {formattedUptime}s</li>
        </ul>
      )}
    </Panel>
  );
}

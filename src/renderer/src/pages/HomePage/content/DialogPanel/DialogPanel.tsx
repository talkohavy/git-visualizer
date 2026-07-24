import { useCallback, useState } from 'react';
import { ipcClient } from '@root/renderer/src/lib/ipc';
import Panel from '../Panel';

export default function DialogPanel(): React.JSX.Element {
  const [folder, setFolder] = useState<string | null>(null);

  const onPickFolderClick = useCallback(async () => {
    const folder = await ipcClient.dialog.selectFolder();

    setFolder(folder);
  }, []);

  return (
    <Panel title='dialog.selectFolder()' pattern='invoke - native dialog in main'>
      <button
        type='button'
        onClick={onPickFolderClick}
        className='w-fit cursor-pointer rounded-full bg-blue-500 px-4 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-blue-600'
      >
        Pick a folder
      </button>

      <p className='break-all font-mono text-sm text-gray-500 dark:text-gray-400'>{folder ?? '(nothing selected)'}</p>
    </Panel>
  );
}

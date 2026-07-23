import type { PropsWithChildren } from 'react';

type PanelProps = PropsWithChildren<{
  /** Monospaced title, e.g. the IPC call being demonstrated. */
  title: string;
  /** Short label describing which IPC pattern this panel exercises. */
  pattern: string;
}>;

export default function Panel(props: PanelProps): React.JSX.Element {
  const { title, pattern, children } = props;

  return (
    <section className='flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-5 text-left shadow-sm dark:border-slate-700 dark:bg-slate-800'>
      <div>
        <h2 className='font-mono text-sm font-semibold text-gray-900 dark:text-white'>{title}</h2>
        <p className='text-xs uppercase tracking-wide text-gray-400 dark:text-gray-500'>{pattern}</p>
      </div>

      {children}
    </section>
  );
}

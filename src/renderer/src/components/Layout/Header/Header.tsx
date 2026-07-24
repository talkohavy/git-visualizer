import DarkModeToggle from './DarkModeToggle';

export default function Header() {
  return (
    <header className='relative flex h-12 w-full items-center justify-end gap-4 border-b border-gray-200 bg-white px-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 dark:shadow-dark-sm'>
      <DarkModeToggle />
    </header>
  );
}

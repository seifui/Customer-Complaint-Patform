'use client';

import { useTheme } from '@/lib/useTheme';
import NavIcon from './NavIcon';

export default function ThemeToggle({ className }) {
  const [theme, toggleTheme] = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      className={'theme-toggle-btn' + (className ? ' ' + className : '')}
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <NavIcon type={isDark ? 'sun' : 'moon'} />
    </button>
  );
}

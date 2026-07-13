'use client';

import { useEffect, useState } from 'react';

const STORAGE_KEY = 'ch-theme';

export function useTheme() {
  const [theme, setThemeState] = useState('light');

  useEffect(() => {
    // localStorage isn't available during SSR, so the stored preference can only
    // be read post-mount — this can't be derived via a lazy useState initializer.
    const stored = localStorage.getItem(STORAGE_KEY) === 'dark' ? 'dark' : 'light';
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setThemeState(stored);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  function toggleTheme() {
    setThemeState((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem(STORAGE_KEY, next);
      return next;
    });
  }

  return [theme, toggleTheme];
}

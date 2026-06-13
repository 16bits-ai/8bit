import { useState, useEffect, useCallback } from 'react';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'carlrocks-theme';

// Resolve the starting theme. The inline script in index.html has usually
// already set data-theme before paint; we mirror that here. Falls back to the
// stored choice, then the OS preference, then dark.
const getInitialTheme = (): Theme => {
  const attr = document.documentElement.getAttribute('data-theme');
  if (attr === 'light' || attr === 'dark') return attr;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {
    /* ignore */
  }
  return window.matchMedia?.('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
};

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  // Reflect the theme onto <html>. We do NOT persist here — only an explicit
  // toggle writes to storage, so a first-time visitor keeps following their OS.
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next: Theme = prev === 'light' ? 'dark' : 'light';
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  return { theme, toggleTheme };
}

export default useTheme;

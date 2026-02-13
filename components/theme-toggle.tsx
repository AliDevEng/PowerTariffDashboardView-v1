'use client';

import { useTheme } from './theme-provider';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return <button onClick={toggleTheme}>{theme === 'dark' ? '☀️ Light' : '🌙 Dark'}</button>;
}

import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../lib/themeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      aria-label="Toggle theme"
    >
      {theme === 'light' ? (
        <Moon className="h-5 w-5 text-slate-700 dark:text-slate-300" />
      ) : (
        <Sun className="h-5 w-5 text-slate-300" />
      )}
    </button>
  );
}

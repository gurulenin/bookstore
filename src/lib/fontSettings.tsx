import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type FontSize = 'small' | 'medium' | 'large' | 'extra-large';

interface FontSettingsContextType {
  fontSize: FontSize;
  setFontSize: (size: FontSize) => void;
  fontSizeClass: string;
}

const FontSettingsContext = createContext<FontSettingsContextType | undefined>(undefined);

const fontSizeMap: Record<FontSize, string> = {
  'small': 'text-sm',
  'medium': 'text-base',
  'large': 'text-lg',
  'extra-large': 'text-xl'
};

export function FontSettingsProvider({ children }: { children: ReactNode }) {
  const [fontSize, setFontSizeState] = useState<FontSize>(() => {
    const saved = localStorage.getItem('fontSize');
    return (saved === 'small' || saved === 'medium' || saved === 'large' || saved === 'extra-large')
      ? saved
      : 'medium';
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('font-size-small', 'font-size-medium', 'font-size-large', 'font-size-extra-large');
    root.classList.add(`font-size-${fontSize}`);
  }, [fontSize]);

  const setFontSize = (size: FontSize) => {
    setFontSizeState(size);
    localStorage.setItem('fontSize', size);
  };

  const fontSizeClass = fontSizeMap[fontSize];

  return (
    <FontSettingsContext.Provider value={{ fontSize, setFontSize, fontSizeClass }}>
      {children}
    </FontSettingsContext.Provider>
  );
}

export function useFontSettings() {
  const context = useContext(FontSettingsContext);
  if (!context) {
    throw new Error('useFontSettings must be used within FontSettingsProvider');
  }
  return context;
}

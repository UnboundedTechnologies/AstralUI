import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';

/* Light/dark control. Owns the color scheme, persists it to localStorage, and sets
   `data-astral-scheme` + `color-scheme` on <html> - which the AstralUI tokens (and
   every `light-dark()`) key off. The sole source of truth for the active scheme. */

export type ColorScheme = 'light' | 'dark';

interface ColorSchemeContextType {
  colorScheme: ColorScheme;
  setColorScheme: (scheme: ColorScheme) => void;
  toggle: () => void;
}

const ColorSchemeContext = createContext<ColorSchemeContextType>({
  colorScheme: 'dark',
  setColorScheme: () => {},
  toggle: () => {},
});

interface ColorSchemeProviderProps {
  children: ReactNode;
  /** Initial scheme when nothing is persisted yet. Default 'dark'. */
  defaultScheme?: ColorScheme;
  /** localStorage key for persistence. Default 'astral-color-scheme'. */
  storageKey?: string;
}

export function ColorSchemeProvider({ children, defaultScheme = 'dark', storageKey = 'astral-color-scheme' }: ColorSchemeProviderProps) {
  const [colorScheme, setScheme] = useState<ColorScheme>(() => {
    try {
      const v = localStorage.getItem(storageKey);
      if (v === 'light' || v === 'dark') return v;
    } catch { /* ignore */ }
    return defaultScheme;
  });

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-astral-scheme', colorScheme);
    root.style.colorScheme = colorScheme;
  }, [colorScheme]);

  const setColorScheme = useCallback((scheme: ColorScheme) => {
    try { localStorage.setItem(storageKey, scheme); } catch { /* ignore */ }
    setScheme(scheme);
  }, [storageKey]);

  const toggle = useCallback(() => {
    setScheme(prev => {
      const next = prev === 'dark' ? 'light' : 'dark';
      try { localStorage.setItem(storageKey, next); } catch { /* ignore */ }
      return next;
    });
  }, [storageKey]);

  return (
    <ColorSchemeContext.Provider value={{ colorScheme, setColorScheme, toggle }}>
      {children}
    </ColorSchemeContext.Provider>
  );
}

export function useColorScheme() {
  return useContext(ColorSchemeContext);
}

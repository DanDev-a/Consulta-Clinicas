import { useState, useEffect, useCallback, createContext, useContext, type Dispatch, type SetStateAction, type ReactNode } from 'react';

const THEMES = [
  'catppuccin-mocha',
  'catppuccin-latte',
  'tailwind-dark',
  'tailwind-light',
  'nord',
  'nord-light',
] as const;

export type MedicalTheme = typeof THEMES[number];

export type ThemeFamily = 'catppuccin' | 'tailwind' | 'nord';

const FAMILY_MAP: Record<ThemeFamily, { dark: MedicalTheme; light: MedicalTheme }> = {
  catppuccin: { dark: 'catppuccin-mocha', light: 'catppuccin-latte' },
  tailwind: { dark: 'tailwind-dark', light: 'tailwind-light' },
  nord: { dark: 'nord', light: 'nord-light' },
};

const DARK_THEMES: readonly MedicalTheme[] = ['catppuccin-mocha', 'tailwind-dark', 'nord'];

export function isDarkTheme(theme: MedicalTheme): boolean {
  return (DARK_THEMES as readonly MedicalTheme[]).includes(theme);
}

export function getFamily(theme: MedicalTheme): ThemeFamily {
  if (theme.startsWith('catppuccin')) return 'catppuccin';
  if (theme.startsWith('tailwind')) return 'tailwind';
  return 'nord';
}

export function getThemeForFamily(family: ThemeFamily, dark: boolean): MedicalTheme {
  return dark ? FAMILY_MAP[family].dark : FAMILY_MAP[family].light;
}

export interface UseThemeReturn {
  theme: MedicalTheme;
  setTheme: Dispatch<SetStateAction<MedicalTheme>>;
  toggleTheme: () => void;
  allThemes: readonly MedicalTheme[];
}

const DEFAULT_THEME: MedicalTheme = 'catppuccin-mocha';
const STORAGE_KEY = 'appmedica-theme';

function getInitialTheme(): MedicalTheme {
  if (typeof window === 'undefined') return DEFAULT_THEME;
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === null) return DEFAULT_THEME;
  return (THEMES as readonly MedicalTheme[]).includes(saved as MedicalTheme) ? (saved as MedicalTheme) : DEFAULT_THEME;
}

const ThemeContext = createContext<UseThemeReturn | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<MedicalTheme>(getInitialTheme);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const family = getFamily(prev);
      const dark = isDarkTheme(prev);
      return getThemeForFamily(family, !dark);
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, allThemes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): UseThemeReturn {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}

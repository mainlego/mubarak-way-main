import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  ThemeType,
  ThemeConfig,
  ThemeContextValue,
  THEMES,
  DEFAULT_THEME,
} from '../types/theme';

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const THEME_STORAGE_KEY = 'mubarak-way-theme';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeType>(() => {
    // Load theme from localStorage
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    if (savedTheme && (savedTheme === 'dark-teal' || savedTheme === 'sand' || savedTheme === 'purple')) {
      return savedTheme as ThemeType;
    }
    return DEFAULT_THEME;
  });

  const setTheme = (newTheme: ThemeType) => {
    setThemeState(newTheme);
    localStorage.setItem(THEME_STORAGE_KEY, newTheme);
  };

  useEffect(() => {
    // Apply theme to document root
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const value: ThemeContextValue = {
    theme,
    setTheme,
    themeConfig: THEMES[theme],
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

/**
 * Theme System Types
 */

export type ThemeType = 'dark-teal' | 'sand' | 'purple';

export interface ThemeConfig {
  name: ThemeType;
  displayName: string;
  colors: {
    primary: string;
    primaryLight: string;
    primaryLighter: string;
    primaryDark: string;
    accent: string;
    accentLight: string;
    accentDark: string;
  };
  isDark: boolean;
}

export const THEMES: Record<ThemeType, ThemeConfig> = {
  'dark-teal': {
    name: 'dark-teal',
    displayName: 'Темная бирюза',
    colors: {
      primary: '#0D3D3F',
      primaryLight: '#1A5456',
      primaryLighter: '#277073',
      primaryDark: '#082A2C',
      accent: '#D4AF37',
      accentLight: '#E5C654',
      accentDark: '#B8941D',
    },
    isDark: true,
  },
  'sand': {
    name: 'sand',
    displayName: 'Песочный',
    colors: {
      primary: '#F5E6D3',
      primaryLight: '#FAF0E4',
      primaryLighter: '#FDF7EF',
      primaryDark: '#E8D4B8',
      accent: '#8B6F47',
      accentLight: '#A68759',
      accentDark: '#6F5736',
    },
    isDark: false,
  },
  'purple': {
    name: 'purple',
    displayName: 'Фиолетовый',
    colors: {
      primary: '#6B4E8C',
      primaryLight: '#8B6EAC',
      primaryLighter: '#AB8ECC',
      primaryDark: '#4B2E6C',
      accent: '#D4A5A5',
      accentLight: '#E4B5B5',
      accentDark: '#C49595',
    },
    isDark: true,
  },
};

export const DEFAULT_THEME: ThemeType = 'dark-teal';

export interface ThemeContextValue {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  themeConfig: ThemeConfig;
}

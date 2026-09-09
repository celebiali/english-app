import { create } from 'zustand';

export type AppTheme = 'light' | 'dark' | 'system';
export type FontSizeValue = 13 | 15 | 17 | 19 | 21;
export type FontFamilyValue = 'system' | 'serif' | 'rounded';

export interface ThemeColors {
  // Page & Surfaces
  background: string;
  cardBackground: string;
  subtleBackground: string;
  border: string;
  borderSubtle: string;

  // Brand (Single brand color across app - modern blue)
  brand: string;
  brandLight: string;
  brandLightBorder: string;
  primary: string;
  primaryLight: string;

  // Accent Warm (Secondary accent ONLY for streak/seri, warnings, attention badges)
  accentWarm: string;
  accentWarmLight: string;
  accent: string;

  // Success
  success: string;
  successLight: string;

  // Error / Danger
  error: string;
  errorLight: string;

  // Typography
  text: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textOnBrand: string;

  // Theme Mode
  isDark: boolean;
}

export const THEME_PALETTES: Record<AppTheme, ThemeColors> = {
  light: {
    background: '#F8FAFC',
    cardBackground: '#FFFFFF',
    subtleBackground: '#F1F5F9',
    border: '#E2E8F0',
    borderSubtle: '#EDF2F7',
    brand: '#2563EB',
    brandLight: 'rgba(37, 99, 235, 0.09)',
    brandLightBorder: 'rgba(37, 99, 235, 0.22)',
    primary: '#2563EB',
    primaryLight: 'rgba(37, 99, 235, 0.09)',
    accentWarm: '#F97316',
    accentWarmLight: 'rgba(249, 115, 22, 0.12)',
    accent: '#F97316',
    success: '#2563EB',
    successLight: 'rgba(37, 99, 235, 0.12)',
    error: '#DC2626',
    errorLight: 'rgba(220, 38, 38, 0.12)',
    text: '#0F172A',
    textPrimary: '#0F172A',
    textSecondary: '#64748B',
    textMuted: '#94A3B8',
    textOnBrand: '#FFFFFF',
    isDark: false,
  },
  dark: {
    background: '#F8FAFC',
    cardBackground: '#FFFFFF',
    subtleBackground: '#F1F5F9',
    border: '#E2E8F0',
    borderSubtle: '#EDF2F7',
    brand: '#2563EB',
    brandLight: 'rgba(37, 99, 235, 0.09)',
    brandLightBorder: 'rgba(37, 99, 235, 0.22)',
    primary: '#2563EB',
    primaryLight: 'rgba(37, 99, 235, 0.09)',
    accentWarm: '#F97316',
    accentWarmLight: 'rgba(249, 115, 22, 0.12)',
    accent: '#F97316',
    success: '#2563EB',
    successLight: 'rgba(37, 99, 235, 0.12)',
    error: '#DC2626',
    errorLight: 'rgba(220, 38, 38, 0.12)',
    text: '#0F172A',
    textPrimary: '#0F172A',
    textSecondary: '#64748B',
    textMuted: '#94A3B8',
    textOnBrand: '#FFFFFF',
    isDark: false,
  },
  system: {
    background: '#F8FAFC',
    cardBackground: '#FFFFFF',
    subtleBackground: '#F1F5F9',
    border: '#E2E8F0',
    borderSubtle: '#EDF2F7',
    brand: '#2563EB',
    brandLight: 'rgba(37, 99, 235, 0.09)',
    brandLightBorder: 'rgba(37, 99, 235, 0.22)',
    primary: '#2563EB',
    primaryLight: 'rgba(37, 99, 235, 0.09)',
    accentWarm: '#F97316',
    accentWarmLight: 'rgba(249, 115, 22, 0.12)',
    accent: '#F97316',
    success: '#2563EB',
    successLight: 'rgba(37, 99, 235, 0.12)',
    error: '#DC2626',
    errorLight: 'rgba(220, 38, 38, 0.12)',
    text: '#0F172A',
    textPrimary: '#0F172A',
    textSecondary: '#64748B',
    textMuted: '#94A3B8',
    textOnBrand: '#FFFFFF',
    isDark: false,
  },
};

interface ThemeState {
  theme: AppTheme;
  colors: ThemeColors;
  fontSize: FontSizeValue;
  isSystemFontSize: boolean;
  fontFamily: FontFamilyValue;
  autoNightMode: boolean;
  lastSyncTime: string;

  setTheme: (theme: AppTheme) => void;
  setFontSize: (size: FontSizeValue) => void;
  setIsSystemFontSize: (useSystem: boolean) => void;
  setFontFamily: (font: FontFamilyValue) => void;
  setAutoNightMode: (enabled: boolean) => void;
  updateLastSyncTime: () => void;
  getColors: () => ThemeColors;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: 'light',
  colors: THEME_PALETTES.light,
  fontSize: 17,
  isSystemFontSize: false,
  fontFamily: 'system',
  autoNightMode: false,
  lastSyncTime: '1 Dakika Önce',

  setTheme: (_theme: AppTheme) =>
    set({
      theme: 'light',
      colors: THEME_PALETTES.light,
    }),
  setFontSize: (fontSize: FontSizeValue) => set({ fontSize, isSystemFontSize: false }),
  setIsSystemFontSize: (isSystemFontSize: boolean) => set({ isSystemFontSize }),
  setFontFamily: (fontFamily: FontFamilyValue) => set({ fontFamily }),
  setAutoNightMode: (autoNightMode: boolean) => set({ autoNightMode }),
  updateLastSyncTime: () => set({ lastSyncTime: 'Az Önce' }),
  getColors: () => THEME_PALETTES.light,
}));

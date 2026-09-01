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
    success: '#16A34A',
    successLight: 'rgba(22, 163, 74, 0.12)',
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
    background: '#0B0F19',
    cardBackground: '#1C2538',
    subtleBackground: '#26334A',
    border: '#2E3D59',
    borderSubtle: '#222D42',
    brand: '#3B82F6',
    brandLight: 'rgba(59, 130, 246, 0.18)',
    brandLightBorder: 'rgba(59, 130, 246, 0.35)',
    primary: '#3B82F6',
    primaryLight: 'rgba(59, 130, 246, 0.18)',
    accentWarm: '#FB923C',
    accentWarmLight: 'rgba(251, 146, 60, 0.20)',
    accent: '#FB923C',
    success: '#22C55E',
    successLight: 'rgba(34, 197, 94, 0.20)',
    error: '#EF4444',
    errorLight: 'rgba(239, 68, 68, 0.20)',
    text: '#FFFFFF',
    textPrimary: '#FFFFFF',
    textSecondary: '#94A3B8',
    textMuted: '#64748B',
    textOnBrand: '#FFFFFF',
    isDark: true,
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
    success: '#16A34A',
    successLight: 'rgba(22, 163, 74, 0.12)',
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

  setTheme: (theme: AppTheme) =>
    set({
      theme,
      colors: THEME_PALETTES[theme] || THEME_PALETTES.light,
    }),
  setFontSize: (fontSize: FontSizeValue) => set({ fontSize, isSystemFontSize: false }),
  setIsSystemFontSize: (isSystemFontSize: boolean) => set({ isSystemFontSize }),
  setFontFamily: (fontFamily: FontFamilyValue) => set({ fontFamily }),
  setAutoNightMode: (autoNightMode: boolean) => set({ autoNightMode }),
  updateLastSyncTime: () => set({ lastSyncTime: 'Az Önce' }),
  getColors: () => {
    const current = get().theme;
    return THEME_PALETTES[current] || THEME_PALETTES.light;
  },
}));

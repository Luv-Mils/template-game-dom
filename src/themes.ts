import type { GameTheme } from './types';

export const THEMES: Record<string, GameTheme> = {
  midnight: {
    id: 'midnight', name: 'Midnight',
    colors: {
      primary: '#6366F1', primaryLight: '#818CF8', secondary: '#A78BFA',
      background: '#0F0D1A', surface: '#1A1830', surfaceAlt: '#252340',
      foreground: '#E2E8F0', muted: '#94A3B8', border: '#2D2B4E',
      accent: '#F59E0B', danger: '#EF4444', success: '#22C55E',
    },
    isDark: true,
  },
  ocean: {
    id: 'ocean', name: 'Ocean',
    colors: {
      primary: '#0891B2', primaryLight: '#22D3EE', secondary: '#2DD4BF',
      background: '#0C1222', surface: '#132030', surfaceAlt: '#1A2940',
      foreground: '#E0F2FE', muted: '#7DD3FC', border: '#1E3A5F',
      accent: '#FACC15', danger: '#F43F5E', success: '#10B981',
    },
    isDark: true,
  },
  ember: {
    id: 'ember', name: 'Ember',
    colors: {
      primary: '#F97316', primaryLight: '#FB923C', secondary: '#F59E0B',
      background: '#1A0C08', surface: '#2D1810', surfaceAlt: '#3D2418',
      foreground: '#FEF3C7', muted: '#D4A574', border: '#4A2D1A',
      accent: '#EF4444', danger: '#DC2626', success: '#16A34A',
    },
    isDark: true,
  },
};

export function getTheme(id: string): GameTheme {
  return THEMES[id] ?? THEMES.midnight;
}

export function hexToRgb(hex: string): string {
  const h = hex.replace('#', '');
  return parseInt(h.substring(0, 2), 16) + ' ' + parseInt(h.substring(2, 4), 16) + ' ' + parseInt(h.substring(4, 6), 16);
}

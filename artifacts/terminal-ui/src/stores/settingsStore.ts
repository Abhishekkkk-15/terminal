import { create } from 'zustand';

interface SettingsStore {
  theme: 'dark' | 'light' | 'system';
  fontSize: number;
  fontFamily: string;
  opacity: number;
  aiModel: string;
  shellPath: string;
  keyboardShortcuts: Record<string, string>;
  updateSetting: <K extends keyof SettingsStore>(key: K, value: SettingsStore[K]) => void;
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  theme: 'dark',
  fontSize: 14,
  fontFamily: 'JetBrains Mono',
  opacity: 100,
  aiModel: 'Claude 3.5 Sonnet',
  shellPath: '/bin/zsh',
  keyboardShortcuts: {
    'commandPalette': 'Ctrl+P',
    'toggleAi': 'Ctrl+Shift+A',
    'toggleSidebar': 'Ctrl+B'
  },
  updateSetting: (key, value) => set({ [key]: value })
}));

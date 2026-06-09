import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type CursorStyle = 'block' | 'underline' | 'bar';
export type AppTheme = 'dark' | 'light' | 'system';

interface SettingsStore {
  // App chrome
  theme: AppTheme;

  // Terminal typography
  fontSize: number;
  fontFamily: string;
  lineHeight: number;
  letterSpacing: number;

  // Terminal behavior
  scrollback: number;
  cursorStyle: CursorStyle;
  cursorBlink: boolean;

  // Terminal appearance
  colorScheme: string;
  opacity: number;       // terminal background opacity 50–100

  // AI
  aiModel: string;

  // Shell
  shellPath: string;

  // Keyboard shortcuts
  keyboardShortcuts: Record<string, string>;

  updateSetting: <K extends keyof Omit<SettingsStore, 'updateSetting'>>(
    key: K,
    value: SettingsStore[K]
  ) => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      theme: 'dark',

      fontSize: 14,
      fontFamily: 'JetBrains Mono',
      lineHeight: 1.4,
      letterSpacing: 0,

      scrollback: 10000,
      cursorStyle: 'block',
      cursorBlink: true,

      colorScheme: 'Default',
      opacity: 100,

      aiModel: 'Claude 3.5 Sonnet',
      shellPath: '/bin/zsh',

      keyboardShortcuts: {
        commandPalette: 'Ctrl+P',
        toggleAi: 'Ctrl+Shift+A',
        toggleSidebar: 'Ctrl+B',
        clearTerminal: 'Ctrl+L',
        cancelCommand: 'Ctrl+C',
        historyPrev: 'ArrowUp',
        historyNext: 'ArrowDown',
      },

      updateSetting: (key, value) => set({ [key]: value } as Partial<SettingsStore>),
    }),
    { name: 'warp-settings' }
  )
);

export interface TerminalService {
  writeTerminal: (data: string) => Promise<void>;
  resizeTerminal: (cols: number, rows: number) => Promise<void>;
}

export const terminalService: TerminalService = {
  writeTerminal: async (data) => {
    console.log('[Tauri Mock] write_terminal:', data);
  },
  resizeTerminal: async (cols, rows) => {
    console.log(`[Tauri Mock] resize_terminal: ${cols}x${rows}`);
  }
};

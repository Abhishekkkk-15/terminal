import { create } from 'zustand';

export interface CommandBlock {
  id: string;
  command: string;
  workingDir: string;
  gitBranch: string | null;
  timestamp: Date;
  duration: number | null;
  output: string[];
  exitCode: number | null;
  status: 'running' | 'success' | 'error';
}

interface TerminalStore {
  commandBlocks: CommandBlock[];
  isConnected: boolean;
  backendStatus: 'connected' | 'connecting' | 'disconnected';
  activeWorkingDir: string;
  gitBranch: string | null;
  addCommandBlock: (block: CommandBlock) => void;
  updateCommandBlock: (id: string, updates: Partial<CommandBlock>) => void;
  setBackendStatus: (status: 'connected' | 'connecting' | 'disconnected') => void;
  setActiveWorkingDir: (dir: string) => void;
}

export const useTerminalStore = create<TerminalStore>((set) => ({
  commandBlocks: [
    {
      id: '1',
      command: 'cargo build',
      workingDir: '~/project/src',
      gitBranch: 'main',
      timestamp: new Date(Date.now() - 600000),
      duration: 14500,
      output: [
        '   Compiling proc-macro2 v1.0.63',
        '   Compiling unicode-ident v1.0.10',
        '   Compiling quote v1.0.29',
        '   Compiling syn v2.0.25',
        '    Finished dev [unoptimized + debuginfo] target(s) in 14.50s'
      ],
      exitCode: 0,
      status: 'success'
    },
    {
      id: '2',
      command: 'npm run dev',
      workingDir: '~/project/frontend',
      gitBranch: 'feature/terminal',
      timestamp: new Date(Date.now() - 300000),
      duration: 1200,
      output: [
        '> frontend@0.0.0 dev',
        '> vite',
        '',
        '  VITE v5.0.0  ready in 320 ms',
        '',
        '  ➜  Local:   http://localhost:5173/',
        '  ➜  Network: use --host to expose'
      ],
      exitCode: 0,
      status: 'success'
    },
    {
      id: '3',
      command: 'git status',
      workingDir: '~/project/frontend',
      gitBranch: 'feature/terminal',
      timestamp: new Date(Date.now() - 150000),
      duration: 45,
      output: [
        'On branch feature/terminal',
        'Changes not staged for commit:',
        '  (use "git add <file>..." to update what will be committed)',
        '  (use "git restore <file>..." to discard changes in working directory)',
        '\tmodified:   src/App.tsx',
        '\tmodified:   src/index.css',
        '',
        'no changes added to commit (use "git add" and/or "git commit -a")'
      ],
      exitCode: 1,
      status: 'error'
    }
  ],
  isConnected: true,
  backendStatus: 'connected',
  activeWorkingDir: '~/project/frontend',
  gitBranch: 'feature/terminal',
  addCommandBlock: (block) => set((state) => ({ commandBlocks: [...state.commandBlocks, block] })),
  updateCommandBlock: (id, updates) => set((state) => ({
    commandBlocks: state.commandBlocks.map((b) => b.id === id ? { ...b, ...updates } : b)
  })),
  setBackendStatus: (status) => set({ backendStatus: status, isConnected: status === 'connected' }),
  setActiveWorkingDir: (dir) => set({ activeWorkingDir: dir })
}));

import { create } from 'zustand';

export interface Project {
  id: string;
  name: string;
  path: string;
  lastOpened: Date;
  language: string;
}

interface WorkspaceStore {
  projects: Project[];
  activeProject: Project | null;
  setActiveProject: (project: Project) => void;
}

export const useWorkspaceStore = create<WorkspaceStore>((set) => ({
  projects: [
    {
      id: '1',
      name: 'terminal-ui',
      path: '~/projects/terminal-ui',
      lastOpened: new Date(),
      language: 'typescript'
    },
    {
      id: '2',
      name: 'core-backend',
      path: '~/projects/core-backend',
      lastOpened: new Date(Date.now() - 86400000),
      language: 'rust'
    }
  ],
  activeProject: {
    id: '1',
    name: 'terminal-ui',
    path: '~/projects/terminal-ui',
    lastOpened: new Date(),
    language: 'typescript'
  },
  setActiveProject: (project) => set({ activeProject: project })
}));

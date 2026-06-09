import { Project } from '@/stores/workspaceStore';

export interface WorkspaceService {
  getWorkspace: () => Promise<{ projects: Project[], activeProjectId: string }>;
}

export const workspaceService: WorkspaceService = {
  getWorkspace: async () => {
    console.log('[Tauri Mock] get_workspace');
    return {
      projects: [
        {
          id: '1',
          name: 'terminal-ui',
          path: '~/projects/terminal-ui',
          lastOpened: new Date(),
          language: 'typescript'
        }
      ],
      activeProjectId: '1'
    };
  }
};

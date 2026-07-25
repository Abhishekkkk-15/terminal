import React from 'react';
import { Folder, GitBranch, Zap, Activity } from 'lucide-react';
import { useTerminalStore } from '@/stores/terminalStore';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { useAiStore } from '@/stores/aiStore';

export function StatusBar() {
  const { backendStatus, activeWorkingDir, gitBranch } = useTerminalStore();
  const { activeProject } = useWorkspaceStore();
  const { activeModel } = useAiStore();

  const getStatusColor = () => {
    switch (backendStatus) {
      case 'connected': return 'bg-success';
      case 'connecting': return 'bg-yellow-500 animate-pulse';
      case 'disconnected': return 'bg-destructive';
    }
  };

  return (
    <div className="h-7 w-full bg-background border-t border-border flex items-center justify-between px-3 text-[11px] font-mono select-none">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground cursor-pointer transition-colors">
          <Folder size={12} className="text-primary" />
          <span>{activeProject?.name || 'No Project'}</span>
        </div>
        
        <div className="text-muted-foreground">
          {activeWorkingDir.replace(/\/Users\/[^/]+/, '~')}
        </div>

        {gitBranch && (
          <div className="flex items-center gap-1 text-muted-foreground hover:text-foreground cursor-pointer transition-colors">
            <GitBranch size={12} />
            <span>{gitBranch}</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4 text-muted-foreground">
        <div className="flex items-center gap-1.5 cursor-pointer hover:text-foreground transition-colors">
          <Zap size={12} className="text-primary" />
          <span>{activeModel}</span>
        </div>
        
        <div className="flex items-center gap-1.5">
          <span>12ms</span>
          <Activity size={12} />
        </div>

        <div className="flex items-center gap-1.5 cursor-help" title={`Backend: ${backendStatus}`}>
          <div className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
        </div>
      </div>
    </div>
  );
}

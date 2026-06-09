import React from 'react';
import { TerminalSquare, Minus, Square, X } from 'lucide-react';
import { useWorkspaceStore } from '@/stores/workspaceStore';

export function TopBar() {
  const { activeProject } = useWorkspaceStore();

  return (
    <div 
      className="h-10 w-full bg-background border-b border-border flex items-center justify-between px-3 select-none"
      data-tauri-drag-region
    >
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-destructive" />
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <div className="w-3 h-3 rounded-full bg-success" />
        </div>
        
        <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium">
          <TerminalSquare size={16} className="text-primary" />
          <span className="text-foreground">Warp</span>
        </div>
      </div>

      <div className="absolute left-1/2 -translate-x-1/2 flex items-center bg-secondary/50 rounded-md border border-border px-3 py-1">
        <span className="text-xs font-mono">{activeProject?.name || 'No Project'}</span>
      </div>

      <div className="flex items-center gap-2 text-muted-foreground">
        <div className="hover:bg-secondary p-1.5 rounded-md cursor-pointer transition-colors">
          <Minus size={14} />
        </div>
        <div className="hover:bg-secondary p-1.5 rounded-md cursor-pointer transition-colors">
          <Square size={12} />
        </div>
        <div className="hover:bg-destructive hover:text-destructive-foreground p-1.5 rounded-md cursor-pointer transition-colors">
          <X size={14} />
        </div>
      </div>
    </div>
  );
}

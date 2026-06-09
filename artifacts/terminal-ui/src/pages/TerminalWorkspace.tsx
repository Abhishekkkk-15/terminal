import React from 'react';
import { CommandBlockList } from '@/components/terminal/CommandBlockList';
import { XtermTerminal } from '@/components/terminal/XtermTerminal';

export function TerminalWorkspace() {
  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-background">
      <div className="flex-1 overflow-y-auto pb-4 custom-scrollbar">
        <CommandBlockList />
        <div className="h-[40vh] min-h-[200px] mt-4 relative">
          <XtermTerminal />
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { CommandBlockList } from '@/components/terminal/CommandBlockList';
import { XtermTerminal } from '@/components/terminal/XtermTerminal';

export function TerminalWorkspace() {
  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-background">
      {/* Command block history — scrollable, grows to fill available space */}
      <div className="flex-1 overflow-y-auto min-h-0 pb-2 custom-scrollbar">
        <CommandBlockList />
      </div>

      {/* Divider */}
      <div className="h-px bg-border flex-shrink-0" />

      {/*
        xterm lives OUTSIDE the scrollable area in a fixed-height strip.
        This gives FitAddon a stable, non-scrolling parent with known
        dimensions so it can calculate cols/rows accurately.
      */}
      <div className="flex-shrink-0 h-52 min-h-[160px]">
        <XtermTerminal />
      </div>
    </div>
  );
}

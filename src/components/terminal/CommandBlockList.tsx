import React, { useState } from 'react';
import { useTerminalStore } from '@/stores/terminalStore';
import { CommandBlock } from './CommandBlock';

export function CommandBlockList() {
  const { commandBlocks } = useTerminalStore();
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);

  return (
    <div className="flex flex-col w-full">
      {commandBlocks.map((block) => (
        <CommandBlock
          key={block.id}
          block={block}
          isSelected={selectedBlockId === block.id}
          onClick={() => setSelectedBlockId(block.id)}
        />
      ))}
    </div>
  );
}

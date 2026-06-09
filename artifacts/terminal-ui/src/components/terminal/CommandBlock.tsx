import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, ChevronRight, ChevronDown, Clock, GitBranch } from 'lucide-react';
import { CommandBlock as CommandBlockType } from '@/stores/terminalStore';

interface CommandBlockProps {
  block: CommandBlockType;
  isSelected: boolean;
  onClick: () => void;
}

export function CommandBlock({ block, isSelected, onClick }: CommandBlockProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const formatDuration = (ms: number | null) => {
    if (ms === null) return '';
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`group relative flex flex-col w-full border-l-2 transition-colors ${
        isSelected ? 'border-primary bg-secondary/30' : 'border-transparent hover:bg-secondary/10'
      }`}
      onClick={onClick}
      data-testid={`command-block-${block.id}`}
    >
      <div className="flex items-center justify-between px-4 py-2 hover:bg-secondary/20 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="text-muted-foreground hover:text-foreground transition-colors">
            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </div>
          <div className="flex items-center gap-2 text-sm font-mono whitespace-nowrap overflow-hidden">
            <span className="text-success truncate max-w-[200px]" title={block.workingDir}>{block.workingDir}</span>
            {block.gitBranch && (
              <span className="text-muted-foreground flex items-center gap-1 text-xs">
                <GitBranch size={12} /> {block.gitBranch}
              </span>
            )}
            <span className="text-primary font-bold">$</span>
            <span className="text-foreground">{block.command}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3 text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="flex items-center gap-1">
            <Clock size={12} /> {formatTime(block.timestamp)}
          </span>
          {block.duration && (
            <span className="bg-secondary px-1.5 py-0.5 rounded text-[10px]">
              {formatDuration(block.duration)}
            </span>
          )}
        </div>
      </div>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pl-10 pb-2 text-sm font-mono text-muted-foreground whitespace-pre-wrap break-all">
              {block.output.map((line, i) => (
                <div key={i} className="leading-relaxed">{line}</div>
              ))}
              {block.status === 'running' && (
                <div className="flex items-center gap-2 mt-1">
                  <span className="animate-pulse w-2 h-4 bg-primary inline-block" />
                </div>
              )}
            </div>

            {block.status !== 'running' && (
              <div className="flex items-center gap-2 px-4 pl-10 pb-3">
                <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${
                  block.status === 'success' ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
                }`}>
                  {block.status === 'success' ? <Check size={12} /> : <X size={12} />}
                  {block.status === 'success' ? 'Success' : `Error (${block.exitCode})`}
                </span>
                <span className="text-xs text-muted-foreground">
                  in {formatDuration(block.duration)}
                </span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

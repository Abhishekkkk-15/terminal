import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Terminal, Settings, PlaySquare, Folder, GitBranch } from 'lucide-react';

interface CommandItem {
  id: string;
  name: string;
  group: string;
  icon: any;
  shortcut?: string;
  action: () => void;
}

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleToggle = () => setIsOpen((prev) => !prev);
    const handleClose = () => setIsOpen(false);

    document.addEventListener('toggle-command-palette', handleToggle);
    document.addEventListener('close-modals', handleClose);

    return () => {
      document.removeEventListener('toggle-command-palette', handleToggle);
      document.removeEventListener('close-modals', handleClose);
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSearch('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const commands: CommandItem[] = [
    { id: '1', group: 'Navigation', name: 'Go to Terminal', icon: Terminal, action: () => {} },
    { id: '2', group: 'Navigation', name: 'Go to History', icon: History, action: () => {} },
    { id: '3', group: 'Navigation', name: 'Go to Workflows', icon: PlaySquare, action: () => {} },
    { id: '4', group: 'Navigation', name: 'Go to Settings', icon: Settings, shortcut: '⌘,', action: () => {} },
    { id: '5', group: 'Actions', name: 'Toggle AI Panel', icon: Bot, shortcut: '⌘⇧A', action: () => document.dispatchEvent(new CustomEvent('toggle-ai-panel')) },
    { id: '6', group: 'Actions', name: 'Clear Terminal', icon: Terminal, shortcut: '⌘K', action: () => {} },
    { id: '7', group: 'Workflows', name: 'Run Dev Server', icon: PlaySquare, action: () => {} },
    { id: '8', group: 'Workflows', name: 'Build Production', icon: PlaySquare, action: () => {} },
    { id: '9', group: 'Recent Commands', name: 'cargo build', icon: Terminal, action: () => {} },
    { id: '10', group: 'Recent Commands', name: 'git status', icon: GitBranch, action: () => {} },
    { id: '11', group: 'Recent Commands', name: 'npm install', icon: Terminal, action: () => {} },
  ];

  const filteredCommands = search 
    ? commands.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.group.toLowerCase().includes(search.toLowerCase()))
    : commands;

  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filteredCommands.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const cmd = filteredCommands[selectedIndex];
      if (cmd) {
        cmd.action();
        setIsOpen(false);
      }
    }
  };

  const groups = Array.from(new Set(filteredCommands.map(c => c.group)));

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] pointer-events-none">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="bg-card w-full max-w-2xl border border-border shadow-2xl rounded-xl overflow-hidden pointer-events-auto flex flex-col max-h-[60vh]"
            >
              <div className="flex items-center border-b border-border px-4 py-3">
                <Search size={18} className="text-muted-foreground mr-3 shrink-0" />
                <input
                  ref={inputRef}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a command or search..."
                  className="w-full bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
                />
                <span className="text-xs text-muted-foreground border border-border rounded px-1.5 py-0.5 ml-2">ESC</span>
              </div>
              
              <div className="overflow-y-auto p-2 flex-1">
                {filteredCommands.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground text-sm">
                    No results found for "{search}"
                  </div>
                ) : (
                  groups.map((group) => (
                    <div key={group} className="mb-4 last:mb-0">
                      <div className="px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        {group}
                      </div>
                      <div className="space-y-1">
                        {filteredCommands.filter(c => c.group === group).map((cmd) => {
                          const globalIndex = filteredCommands.findIndex(c => c.id === cmd.id);
                          const isSelected = globalIndex === selectedIndex;
                          const Icon = cmd.icon;
                          
                          return (
                            <div
                              key={cmd.id}
                              className={`flex items-center justify-between px-3 py-2 rounded-md cursor-pointer transition-colors ${
                                isSelected ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-secondary'
                              }`}
                              onClick={() => {
                                cmd.action();
                                setIsOpen(false);
                              }}
                              onMouseEnter={() => setSelectedIndex(globalIndex)}
                            >
                              <div className="flex items-center gap-3">
                                <Icon size={16} className={isSelected ? 'text-primary-foreground' : 'text-muted-foreground'} />
                                <span className="text-sm font-medium">{cmd.name}</span>
                              </div>
                              {cmd.shortcut && (
                                <span className={`text-xs px-1.5 py-0.5 rounded ${
                                  isSelected ? 'bg-primary-foreground/20' : 'bg-secondary text-muted-foreground'
                                }`}>
                                  {cmd.shortcut}
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
// Add to avoid import error
import { History, Bot } from 'lucide-react';
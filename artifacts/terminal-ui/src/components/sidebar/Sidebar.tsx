import React, { useState } from 'react';
import { TerminalSquare, FolderOpen, History, Settings, Bot, PanelLeftClose, PanelLeft, PlaySquare } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { useAiStore } from '@/stores/aiStore';

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [location] = useLocation();
  const { isOpen: isAiOpen, setIsOpen: setAiOpen } = useAiStore();

  const toggleAi = () => setAiOpen(!isAiOpen);

  const NavItem = ({ href, icon: Icon, label, isActive }: any) => {
    const isLinkActive = isActive || location === href;
    
    return (
      <Link href={href} className={`flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-colors relative group ${
        isLinkActive ? 'text-foreground bg-secondary/50' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/30'
      }`}>
        {isLinkActive && (
          <motion.div layoutId="sidebar-active" className="absolute left-0 top-1 bottom-1 w-1 bg-primary rounded-r-md" />
        )}
        <Icon size={18} className={isLinkActive ? 'text-primary' : ''} />
        <AnimatePresence>
          {!isCollapsed && (
            <motion.span 
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              className="text-sm font-medium whitespace-nowrap overflow-hidden"
            >
              {label}
            </motion.span>
          )}
        </AnimatePresence>
      </Link>
    );
  };

  const ActionItem = ({ onClick, icon: Icon, label, isActive }: any) => {
    return (
      <div onClick={onClick} className={`flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-colors relative group ${
        isActive ? 'text-foreground bg-secondary/50' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/30'
      }`}>
        {isActive && (
          <motion.div layoutId="sidebar-active" className="absolute left-0 top-1 bottom-1 w-1 bg-primary rounded-r-md" />
        )}
        <Icon size={18} className={isActive ? 'text-primary' : ''} />
        <AnimatePresence>
          {!isCollapsed && (
            <motion.span 
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              className="text-sm font-medium whitespace-nowrap overflow-hidden"
            >
              {label}
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <motion.div 
      initial={false}
      animate={{ width: isCollapsed ? 64 : 240 }}
      className="h-full bg-sidebar border-r border-border flex flex-col shrink-0 z-10 relative overflow-hidden"
    >
      <div className="flex-1 py-4 px-2 flex flex-col gap-1 overflow-y-auto overflow-x-hidden">
        <NavItem href="/" icon={TerminalSquare} label="Terminal" />
        <NavItem href="/history" icon={History} label="History" />
        <NavItem href="/workflows" icon={PlaySquare} label="Workflows" />
        
        {!isCollapsed && (
          <div className="mt-4 mb-2 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Workspace
          </div>
        )}
        <ActionItem onClick={() => {}} icon={FolderOpen} label="Projects" />
        
        <div className="flex-1" />
        
        <ActionItem onClick={toggleAi} icon={Bot} label="AI Assistant" isActive={isAiOpen} />
        <NavItem href="/settings" icon={Settings} label="Settings" />
      </div>

      <div className="p-2 border-t border-border">
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full flex items-center justify-center p-2 text-muted-foreground hover:text-foreground hover:bg-secondary/30 rounded-md transition-colors"
        >
          {isCollapsed ? <PanelLeft size={18} /> : <PanelLeftClose size={18} />}
        </button>
      </div>
    </motion.div>
  );
}

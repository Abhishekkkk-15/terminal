import { useState, useEffect } from 'react';

export function useKeyboardShortcuts() {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+P
      if (e.ctrlKey && e.key === 'p') {
        e.preventDefault();
        document.dispatchEvent(new CustomEvent('toggle-command-palette'));
      }
      // Ctrl+Shift+A
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        document.dispatchEvent(new CustomEvent('toggle-ai-panel'));
      }
      // Ctrl+B
      if (e.ctrlKey && e.key === 'b') {
        e.preventDefault();
        document.dispatchEvent(new CustomEvent('toggle-sidebar'));
      }
      // Esc
      if (e.key === 'Escape') {
        document.dispatchEvent(new CustomEvent('close-modals'));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
}

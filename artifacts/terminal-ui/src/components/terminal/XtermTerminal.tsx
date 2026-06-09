import React, { useEffect, useRef } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from '@xterm/addon-fit';
import { WebLinksAddon } from '@xterm/addon-web-links';
import 'xterm/css/xterm.css';
import { useSettingsStore } from '@/stores/settingsStore';
import { useTerminalStore } from '@/stores/terminalStore';

export function XtermTerminal() {
  const terminalRef = useRef<HTMLDivElement>(null);
  const termInstance = useRef<Terminal | null>(null);
  const fitAddon = useRef<FitAddon | null>(null);
  
  const { fontSize, fontFamily, opacity } = useSettingsStore();
  const { activeWorkingDir, gitBranch } = useTerminalStore();

  useEffect(() => {
    if (!terminalRef.current) return;

    const term = new Terminal({
      fontFamily,
      fontSize,
      theme: {
        background: `rgba(20, 21, 23, ${opacity / 100})`, // matches app background roughly
        foreground: '#e4e4e7',
        cursor: '#00d5ff',
        cursorAccent: '#141517',
        selectionBackground: 'rgba(0, 213, 255, 0.3)',
        black: '#141517',
        red: '#e74c3c',
        green: '#2ecc71',
        yellow: '#f1c40f',
        blue: '#00d5ff',
        magenta: '#9b59b6',
        cyan: '#00d5ff',
        white: '#e4e4e7',
        brightBlack: '#7f8c8d',
        brightRed: '#e74c3c',
        brightGreen: '#2ecc71',
        brightYellow: '#f1c40f',
        brightBlue: '#00d5ff',
        brightMagenta: '#9b59b6',
        brightCyan: '#00d5ff',
        brightWhite: '#ffffff',
      },
      cursorBlink: true,
      cursorStyle: 'block',
    });

    const fit = new FitAddon();
    term.loadAddon(fit);
    term.loadAddon(new WebLinksAddon());

    term.open(terminalRef.current);
    fit.fit();
    
    term.writeln('\x1b[1;36mWelcome to Warp UI\x1b[0m');
    term.writeln(`Type a command or try \x1b[33mCtrl+P\x1b[0m for command palette.`);
    term.writeln('');
    
    const prompt = () => {
      const gitPart = gitBranch ? ` \x1b[35mgit:(\x1b[31m${gitBranch}\x1b[35m)\x1b[0m` : '';
      term.write(`\x1b[32m${activeWorkingDir}\x1b[0m${gitPart} \x1b[1;36m$\x1b[0m `);
    };
    
    prompt();

    term.onKey(({ key, domEvent }) => {
      const printable = !domEvent.altKey && !domEvent.ctrlKey && !domEvent.metaKey;
      if (domEvent.keyCode === 13) {
        term.writeln('');
        prompt();
      } else if (domEvent.keyCode === 8) {
        if (term.buffer.active.cursorX > 2) {
          term.write('\b \b');
        }
      } else if (printable) {
        term.write(key);
      }
    });

    termInstance.current = term;
    fitAddon.current = fit;

    const handleResize = () => {
      fit.fit();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      term.dispose();
    };
  }, []);

  useEffect(() => {
    if (termInstance.current) {
      termInstance.current.options.fontSize = fontSize;
      termInstance.current.options.fontFamily = fontFamily;
      // @ts-ignore
      termInstance.current.options.theme.background = `rgba(20, 21, 23, ${opacity / 100})`;
      fitAddon.current?.fit();
    }
  }, [fontSize, fontFamily, opacity]);

  return (
    <div className="w-full h-full flex-1 min-h-0 relative" data-testid="terminal-container">
      <div ref={terminalRef} className="absolute inset-0 pl-4 py-2" />
    </div>
  );
}

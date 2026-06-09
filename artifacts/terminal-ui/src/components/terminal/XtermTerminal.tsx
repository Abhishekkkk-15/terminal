import { useEffect, useRef } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from '@xterm/addon-fit';
import { WebLinksAddon } from '@xterm/addon-web-links';
import 'xterm/css/xterm.css';
import { useSettingsStore } from '@/stores/settingsStore';
import { terminalService } from '@/services/tauri/terminal';
import { eventsService } from '@/services/tauri/events';

// ─── Theme ────────────────────────────────────────────────────────────────────
// Must stay in sync with the app's CSS palette (index.css --background etc.)
const XTERM_THEME = {
  background: '#0d0e10',
  foreground: '#e4e4e7',
  cursor: '#00d5ff',
  cursorAccent: '#0d0e10',
  selectionBackground: 'rgba(0, 213, 255, 0.25)',
  selectionForeground: '#ffffff',
  black: '#1a1b1e',
  red: '#e74c3c',
  green: '#2ecc71',
  yellow: '#f1c40f',
  blue: '#00d5ff',
  magenta: '#9b59b6',
  cyan: '#00bcd4',
  white: '#e4e4e7',
  brightBlack: '#555e6e',
  brightRed: '#ff6b6b',
  brightGreen: '#5efc82',
  brightYellow: '#ffe066',
  brightBlue: '#6ec6ff',
  brightMagenta: '#ce93d8',
  brightCyan: '#80deea',
  brightWhite: '#ffffff',
};

export function XtermTerminal() {
  const containerRef = useRef<HTMLDivElement>(null);
  const termRef = useRef<Terminal | null>(null);
  const fitRef = useRef<FitAddon | null>(null);

  const { fontSize, fontFamily } = useSettingsStore();

  // ── Mount / unmount ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current) return;

    const term = new Terminal({
      fontFamily: fontFamily ?? "'JetBrains Mono', 'Menlo', monospace",
      fontSize: fontSize ?? 14,
      lineHeight: 1.4,
      letterSpacing: 0,
      theme: XTERM_THEME,
      cursorBlink: true,
      cursorStyle: 'block',
      scrollback: 5000,
      allowTransparency: true,
      // Raw mode: the PTY (mock or real Rust) handles ALL echo and line editing.
      // The terminal component only forwards data — it never interprets it locally.
    });

    const fit = new FitAddon();
    term.loadAddon(fit);
    term.loadAddon(new WebLinksAddon());

    term.open(containerRef.current);
    fit.fit();

    termRef.current = term;
    fitRef.current = fit;

    // ── Input → service layer ────────────────────────────────────────────────
    // All keystrokes and paste events are forwarded verbatim to the PTY service.
    // The component NEVER echoes, interprets, or handles them locally.
    // Swap terminalService.writeTerminal for invoke("write_terminal") to connect Rust.
    const disposeInput = term.onData((data) => {
      terminalService.writeTerminal(data);
    });

    // ── Output ← service layer ───────────────────────────────────────────────
    // All text written to the terminal arrives via the terminal-output event.
    // The mock PTY emits these; the real Rust PTY will emit the same events via Tauri listen().
    const disposeOutput = eventsService.listen('terminal-output', ({ data }) => {
      term.write(data);
    });

    // ── Resize → service layer ───────────────────────────────────────────────
    // Notify the PTY about viewport changes so it can reflow line wrapping.
    // Swap for invoke("resize_terminal", { cols, rows }) with the Rust backend.
    const disposeResize = term.onResize(({ cols, rows }) => {
      terminalService.resizeTerminal(cols, rows);
    });

    // ── Window resize ────────────────────────────────────────────────────────
    const onWindowResize = () => {
      fit.fit();
    };
    window.addEventListener('resize', onWindowResize);

    // ── Kick off the PTY session ─────────────────────────────────────────────
    // Sends the welcome message + first prompt through the event bus so it
    // arrives via the same terminal-output path as all other PTY output.
    terminalService.init();

    return () => {
      disposeInput.dispose();
      disposeResize.dispose();
      disposeOutput(); // eventsService.listen returns an unlisten fn
      window.removeEventListener('resize', onWindowResize);
      term.dispose();
      termRef.current = null;
      fitRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally empty — terminal mounts once

  // ── Settings changes (font size / family) ──────────────────────────────────
  // Applied directly to the live xterm instance without remounting.
  useEffect(() => {
    const term = termRef.current;
    if (!term) return;
    term.options.fontSize = fontSize;
    term.options.fontFamily = fontFamily;
    fitRef.current?.fit();
  }, [fontSize, fontFamily]);

  return (
    <div
      className="w-full h-full min-h-0 relative"
      data-testid="xterm-container"
      // Clicking the wrapper focuses the terminal so keystrokes are captured
      onClick={() => termRef.current?.focus()}
    >
      {/* xterm mounts into this div — padding via CSS avoids xterm viewport math errors */}
      <div
        ref={containerRef}
        className="absolute inset-0"
        style={{ padding: '8px 12px' }}
      />
    </div>
  );
}

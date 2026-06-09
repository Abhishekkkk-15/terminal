import { useEffect, useRef } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from '@xterm/addon-fit';
import { WebLinksAddon } from '@xterm/addon-web-links';
import 'xterm/css/xterm.css';
import { useSettingsStore } from '@/stores/settingsStore';
import { terminalService } from '@/services/tauri/terminal';
import { eventsService } from '@/services/tauri/events';

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
  // Outer wrapper — padding lives here so FitAddon measures the content box correctly.
  const wrapperRef = useRef<HTMLDivElement>(null);
  // xterm mounts into this div — ZERO padding, fills 100% of wrapper content box.
  const mountRef = useRef<HTMLDivElement>(null);

  const termRef = useRef<Terminal | null>(null);
  const fitRef = useRef<FitAddon | null>(null);

  const { fontSize, fontFamily } = useSettingsStore();

  useEffect(() => {
    if (!mountRef.current) return;

    const term = new Terminal({
      fontFamily: fontFamily ?? "'JetBrains Mono', 'Menlo', monospace",
      fontSize: fontSize ?? 14,
      lineHeight: 1.4,
      theme: XTERM_THEME,
      cursorBlink: true,
      cursorStyle: 'block',
      scrollback: 5000,
      allowTransparency: true,
    });

    const fit = new FitAddon();
    term.loadAddon(fit);
    term.loadAddon(new WebLinksAddon());

    // Mount into the zero-padding div so FitAddon reads the correct clientWidth.
    term.open(mountRef.current);

    termRef.current = term;
    fitRef.current = fit;

    // Fit AFTER the browser has painted the layout.
    // requestAnimationFrame ensures mountRef has its final dimensions.
    requestAnimationFrame(() => {
      fit.fit();
      terminalService.init();
    });

    // ── Input → service layer ────────────────────────────────────────────────
    const disposeInput = term.onData((data) => {
      terminalService.writeTerminal(data);
    });

    // ── Output ← service layer ───────────────────────────────────────────────
    const disposeOutput = eventsService.listen('terminal-output', ({ data }) => {
      term.write(data);
    });

    // ── Resize → service layer ───────────────────────────────────────────────
    const disposeResize = term.onResize(({ cols, rows }) => {
      terminalService.resizeTerminal(cols, rows);
    });

    // ── ResizeObserver on the WRAPPER ────────────────────────────────────────
    // Catches window resize AND panel resize (react-resizable-panels drags).
    const ro = new ResizeObserver(() => {
      // Debounce with rAF to avoid layout thrashing during panel drag.
      requestAnimationFrame(() => fit.fit());
    });
    if (wrapperRef.current) ro.observe(wrapperRef.current);

    return () => {
      ro.disconnect();
      disposeInput.dispose();
      disposeResize.dispose();
      disposeOutput();
      term.dispose();
      termRef.current = null;
      fitRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Live settings changes — update running terminal without remount.
  useEffect(() => {
    const term = termRef.current;
    if (!term) return;
    term.options.fontSize = fontSize;
    term.options.fontFamily = fontFamily;
    requestAnimationFrame(() => fitRef.current?.fit());
  }, [fontSize, fontFamily]);

  return (
    // Padding is on this outer wrapper — xterm never sees it.
    // bg matches the xterm theme background so the border between
    // character rows and padding is seamless.
    <div
      ref={wrapperRef}
      className="w-full h-full min-h-0 bg-[#0d0e10]"
      style={{ padding: '8px 12px', boxSizing: 'border-box' }}
      data-testid="xterm-container"
      onClick={() => termRef.current?.focus()}
    >
      {/*
        Zero padding, fills the content box of the wrapper.
        FitAddon reads this element's clientWidth/clientHeight
        and gets the correct usable dimensions.
      */}
      <div
        ref={mountRef}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
}

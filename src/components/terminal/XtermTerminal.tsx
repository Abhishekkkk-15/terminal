import { useEffect, useRef } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from '@xterm/addon-fit';
import { WebLinksAddon } from '@xterm/addon-web-links';
import 'xterm/css/xterm.css';
import { useSettingsStore } from '@/stores/settingsStore';
import { terminalService } from '@/services/tauri/terminal';
import { eventsService } from '@/services/tauri/events';
import { getSchemeByName } from '@/lib/terminalThemes';

export function XtermTerminal() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const mountRef = useRef<HTMLDivElement>(null);
  const termRef = useRef<Terminal | null>(null);
  const fitRef = useRef<FitAddon | null>(null);

  const {
    fontSize, fontFamily, lineHeight, letterSpacing,
    cursorStyle, cursorBlink, scrollback,
    colorScheme, opacity,
  } = useSettingsStore();

  // ── Mount once ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!mountRef.current) return;

    const scheme = getSchemeByName(colorScheme);
    const bgWithOpacity = opacity < 100
      ? hexToRgba(scheme.theme.background as string, opacity / 100)
      : scheme.theme.background;

    const term = new Terminal({
      fontFamily: `'${fontFamily}', 'JetBrains Mono', 'Menlo', monospace`,
      fontSize,
      lineHeight,
      letterSpacing,
      theme: { ...scheme.theme, background: bgWithOpacity },
      cursorBlink,
      cursorStyle,
      scrollback,
      allowTransparency: true,
    });

    const fit = new FitAddon();
    term.loadAddon(fit);
    term.loadAddon(new WebLinksAddon());
    term.open(mountRef.current);

    termRef.current = term;
    fitRef.current = fit;

    // Double rAF ensures the terminal's render service is fully initialized
    // before FitAddon tries to read character dimensions.
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        try {
          fit.fit();
        } catch {
          // render service not ready yet — try once more after a paint
          setTimeout(() => { try { fit.fit(); } catch { /* ignore */ } }, 50);
        }
        terminalService.init();
      })
    );

    const disposeInput = term.onData((data) => terminalService.writeTerminal(data));
    const disposeOutput = eventsService.listen('terminal-output', ({ data }) => term.write(data));
    const disposeResize = term.onResize(({ cols, rows }) => terminalService.resizeTerminal(cols, rows));

    const ro = new ResizeObserver(() =>
      requestAnimationFrame(() => {
        try { fit.fit(); } catch { /* terminal may have been disposed */ }
      })
    );
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

  // ── Reactively apply settings to live instance ───────────────────────────
  useEffect(() => {
    const term = termRef.current;
    if (!term) return;
    term.options.fontSize = fontSize;
    term.options.fontFamily = `'${fontFamily}', 'JetBrains Mono', 'Menlo', monospace`;
    term.options.lineHeight = lineHeight;
    term.options.letterSpacing = letterSpacing;
    requestAnimationFrame(() => fitRef.current?.fit());
  }, [fontSize, fontFamily, lineHeight, letterSpacing]);

  useEffect(() => {
    const term = termRef.current;
    if (!term) return;
    term.options.cursorStyle = cursorStyle;
    term.options.cursorBlink = cursorBlink;
  }, [cursorStyle, cursorBlink]);

  useEffect(() => {
    const term = termRef.current;
    if (!term) return;
    const scheme = getSchemeByName(colorScheme);
    const bgWithOpacity = opacity < 100
      ? hexToRgba(scheme.theme.background as string, opacity / 100)
      : scheme.theme.background;
    term.options.theme = { ...scheme.theme, background: bgWithOpacity };
  }, [colorScheme, opacity]);

  return (
    <div
      ref={wrapperRef}
      className="w-full h-full min-h-0"
      style={{ padding: '8px 12px', boxSizing: 'border-box', backgroundColor: getSchemeByName(colorScheme).bg }}
      data-testid="xterm-container"
      onClick={() => termRef.current?.focus()}
    >
      <div ref={mountRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

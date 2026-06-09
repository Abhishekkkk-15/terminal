import { useState } from 'react';
import { Monitor, Type, SquareTerminal, Bot, Keyboard, ChevronRight, Check } from 'lucide-react';
import { useSettingsStore, type CursorStyle, type AppTheme } from '@/stores/settingsStore';
import { COLOR_SCHEMES } from '@/lib/terminalThemes';

// ── Reusable primitives ───────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{title}</h3>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Row({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-6">
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground">{label}</p>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

function SliderRow({
  label, description, min, max, step = 1, value, unit = '',
  onChange, format,
}: {
  label: string; description?: string; min: number; max: number; step?: number;
  value: number; unit?: string; onChange: (v: number) => void;
  format?: (v: number) => string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-foreground">{label}</p>
          {description && <p className="text-xs text-muted-foreground">{description}</p>}
        </div>
        <span className="text-sm font-mono text-primary tabular-nums min-w-[3rem] text-right">
          {format ? format(value) : `${value}${unit}`}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(step < 1 ? parseFloat(e.target.value) : parseInt(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none bg-secondary cursor-pointer accent-primary"
        data-testid={`slider-${label.toLowerCase().replace(/\s+/g, '-')}`}
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{format ? format(min) : `${min}${unit}`}</span>
        <span>{format ? format(max) : `${max}${unit}`}</span>
      </div>
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      data-testid="toggle"
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
        checked ? 'bg-primary' : 'bg-secondary border border-border'
      }`}
    >
      <span
        className="inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform"
        style={{ transform: `translateX(${checked ? '18px' : '2px'})` }}
      />
    </button>
  );
}

function SelectRow({
  label, value, options, onChange,
}: {
  label: string; value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <Row label={label}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-secondary border border-border rounded-md px-2.5 py-1.5 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none cursor-pointer min-w-[160px]"
        data-testid={`select-${label.toLowerCase().replace(/\s+/g, '-')}`}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </Row>
  );
}

// ── Tab definitions ───────────────────────────────────────────────────────────

const TABS = [
  { id: 'appearance', label: 'Appearance', icon: Monitor },
  { id: 'terminal', label: 'Terminal', icon: SquareTerminal },
  { id: 'ai', label: 'AI Assistant', icon: Bot },
  { id: 'shortcuts', label: 'Shortcuts', icon: Keyboard },
] as const;

type TabId = typeof TABS[number]['id'];

// ── Main component ────────────────────────────────────────────────────────────

export function SettingsPage() {
  const s = useSettingsStore();
  const [activeTab, setActiveTab] = useState<TabId>('appearance');
  const [remapping, setRemapping] = useState<string | null>(null);

  return (
    <div className="flex h-full w-full bg-background overflow-hidden">
      {/* Sidebar nav */}
      <div className="w-56 border-r border-border bg-sidebar flex flex-col p-3 shrink-0">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 py-2 mb-1">Settings</p>
        <div className="space-y-0.5">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              data-testid={`settings-tab-${id}`}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === id
                  ? 'bg-primary/15 text-primary'
                  : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground'
              }`}
            >
              <Icon size={15} />
              {label}
              {activeTab === id && <ChevronRight size={12} className="ml-auto opacity-60" />}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        <div className="max-w-xl space-y-10">

          {/* ── APPEARANCE ────────────────────────────────────────────────── */}
          {activeTab === 'appearance' && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-200">
              <Section title="Theme">
                <div className="grid grid-cols-3 gap-3">
                  {(['dark', 'light', 'system'] as AppTheme[]).map((t) => (
                    <button
                      key={t}
                      onClick={() => s.updateSetting('theme', t)}
                      data-testid={`theme-${t}`}
                      className={`relative border rounded-lg p-3 cursor-pointer text-center capitalize transition-all ${
                        s.theme === t
                          ? 'border-primary ring-1 ring-primary/40 bg-primary/5'
                          : 'border-border bg-card hover:border-muted-foreground/50'
                      }`}
                    >
                      {s.theme === t && (
                        <span className="absolute top-1.5 right-1.5 text-primary"><Check size={11} /></span>
                      )}
                      <div className={`w-full h-12 rounded mb-2 overflow-hidden flex ${
                        t === 'system' ? '' : ''
                      }`}>
                        {t === 'dark' && <div className="w-full h-full" style={{ background: 'linear-gradient(135deg,#0d0e10 60%,#1a1b2e)' }} />}
                        {t === 'light' && <div className="w-full h-full" style={{ background: 'linear-gradient(135deg,#f5f6fa 60%,#e8ecf4)' }} />}
                        {t === 'system' && (
                          <>
                            <div className="flex-1 h-full" style={{ background: '#0d0e10' }} />
                            <div className="flex-1 h-full" style={{ background: '#f5f6fa' }} />
                          </>
                        )}
                      </div>
                      <span className={`text-xs font-medium ${s.theme === t ? 'text-primary' : 'text-foreground'}`}>
                        {t}
                      </span>
                    </button>
                  ))}
                </div>
              </Section>

              <div className="h-px bg-border" />

              <Section title="Terminal Color Scheme">
                <div className="grid grid-cols-2 gap-2.5">
                  {COLOR_SCHEMES.map((scheme) => (
                    <button
                      key={scheme.name}
                      onClick={() => s.updateSetting('colorScheme', scheme.name)}
                      data-testid={`scheme-${scheme.name.toLowerCase().replace(/\s+/g, '-')}`}
                      className={`relative flex items-center gap-3 p-2.5 rounded-lg border transition-all text-left ${
                        s.colorScheme === scheme.name
                          ? 'border-primary ring-1 ring-primary/40'
                          : 'border-border hover:border-muted-foreground/50'
                      }`}
                    >
                      {/* Mini terminal preview */}
                      <div
                        className="w-10 h-8 rounded flex-shrink-0 relative overflow-hidden"
                        style={{ background: scheme.bg }}
                      >
                        <div className="absolute bottom-1 left-1 flex items-center gap-0.5">
                          <div className="w-3 h-0.5 rounded" style={{ background: scheme.theme.green as string }} />
                          <div className="w-1.5 h-2.5 rounded-sm" style={{ background: scheme.accent }} />
                        </div>
                        <div className="absolute top-1 left-1 space-y-0.5">
                          <div className="w-4 h-0.5 rounded opacity-50" style={{ background: scheme.theme.foreground as string }} />
                          <div className="w-3 h-0.5 rounded opacity-30" style={{ background: scheme.theme.foreground as string }} />
                        </div>
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-foreground truncate">{scheme.name}</p>
                        <div className="flex gap-1 mt-1">
                          {[scheme.theme.red, scheme.theme.green, scheme.theme.yellow, scheme.accent].map((c, i) => (
                            <div key={i} className="w-2 h-2 rounded-full" style={{ background: c as string }} />
                          ))}
                        </div>
                      </div>
                      {s.colorScheme === scheme.name && (
                        <Check size={11} className="absolute top-2 right-2 text-primary" />
                      )}
                    </button>
                  ))}
                </div>
              </Section>

              <div className="h-px bg-border" />

              <Section title="Typography">
                <SelectRow
                  label="Font Family"
                  value={s.fontFamily}
                  onChange={(v) => s.updateSetting('fontFamily', v)}
                  options={[
                    { value: 'JetBrains Mono', label: 'JetBrains Mono' },
                    { value: 'Fira Code', label: 'Fira Code' },
                    { value: 'Menlo', label: 'Menlo' },
                    { value: 'Monaco', label: 'Monaco' },
                    { value: 'Courier New', label: 'Courier New' },
                    { value: 'monospace', label: 'System Monospace' },
                  ]}
                />
                <SliderRow
                  label="Font Size" min={10} max={24} value={s.fontSize} unit="px"
                  onChange={(v) => s.updateSetting('fontSize', v)}
                />
                <SliderRow
                  label="Line Height" min={1.0} max={2.0} step={0.05} value={s.lineHeight}
                  onChange={(v) => s.updateSetting('lineHeight', v)}
                  format={(v) => v.toFixed(2)}
                />
                <SliderRow
                  label="Letter Spacing" min={-1} max={4} step={0.5} value={s.letterSpacing}
                  onChange={(v) => s.updateSetting('letterSpacing', v)}
                  format={(v) => `${v >= 0 ? '+' : ''}${v}px`}
                />
              </Section>

              <div className="h-px bg-border" />

              <Section title="Window">
                <SliderRow
                  label="Terminal Background Opacity" min={20} max={100} value={s.opacity} unit="%"
                  description="Lower values give a translucent feel"
                  onChange={(v) => s.updateSetting('opacity', v)}
                />
              </Section>
            </div>
          )}

          {/* ── TERMINAL ──────────────────────────────────────────────────── */}
          {activeTab === 'terminal' && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-200">
              <Section title="Cursor">
                <Row label="Cursor Style" description="Shape of the blinking cursor">
                  <div className="flex gap-1.5">
                    {(['block', 'underline', 'bar'] as CursorStyle[]).map((style) => (
                      <button
                        key={style}
                        onClick={() => s.updateSetting('cursorStyle', style)}
                        data-testid={`cursor-${style}`}
                        title={style}
                        className={`w-9 h-8 rounded border flex items-center justify-center transition-all ${
                          s.cursorStyle === style
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border bg-secondary text-muted-foreground hover:border-muted-foreground/50'
                        }`}
                      >
                        {style === 'block' && (
                          <div className="w-2.5 h-3.5 rounded-sm bg-current" />
                        )}
                        {style === 'underline' && (
                          <div className="w-3 h-0.5 bg-current mt-3" />
                        )}
                        {style === 'bar' && (
                          <div className="w-0.5 h-3.5 bg-current" />
                        )}
                      </button>
                    ))}
                  </div>
                </Row>
                <Row label="Cursor Blink" description="Animate cursor visibility">
                  <Toggle checked={s.cursorBlink} onChange={(v) => s.updateSetting('cursorBlink', v)} />
                </Row>
              </Section>

              <div className="h-px bg-border" />

              <Section title="Scrollback">
                <SliderRow
                  label="Scrollback Buffer"
                  description="Lines of output history retained"
                  min={1000} max={100000} step={1000}
                  value={s.scrollback}
                  format={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : `${v}`}
                  onChange={(v) => s.updateSetting('scrollback', v)}
                />
              </Section>

              <div className="h-px bg-border" />

              <Section title="Shell Integration">
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1.5">Shell Path</label>
                  <input
                    type="text"
                    value={s.shellPath}
                    onChange={(e) => s.updateSetting('shellPath', e.target.value)}
                    data-testid="input-shell-path"
                    className="w-full bg-secondary border border-border rounded-md px-3 py-2 text-sm font-mono text-foreground focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none"
                  />
                  <p className="text-xs text-muted-foreground mt-1.5">
                    Path to the shell binary. Used when the Rust backend is connected.
                  </p>
                </div>
              </Section>

              {/* Live preview panel */}
              <div className="rounded-lg border border-border overflow-hidden">
                <div className="px-3 py-2 bg-card border-b border-border">
                  <p className="text-xs font-medium text-muted-foreground">Live Preview</p>
                </div>
                <div className="p-4 font-mono text-sm" style={{
                  background: COLOR_SCHEMES.find(c => c.name === s.colorScheme)?.bg ?? '#0d0e10',
                  color: COLOR_SCHEMES.find(c => c.name === s.colorScheme)?.theme.foreground as string ?? '#e4e4e7',
                  fontFamily: `'${s.fontFamily}', monospace`,
                  fontSize: `${s.fontSize}px`,
                  lineHeight: s.lineHeight,
                  letterSpacing: `${s.letterSpacing}px`,
                }}>
                  <span style={{ color: COLOR_SCHEMES.find(c => c.name === s.colorScheme)?.theme.green as string }}>
                    ~/projects/terminal-ui
                  </span>
                  {' '}
                  <span style={{ color: COLOR_SCHEMES.find(c => c.name === s.colorScheme)?.theme.magenta as string }}>
                    git:(feature/terminal)
                  </span>
                  {' $ '}
                  <span style={{
                    display: 'inline-block',
                    width: s.cursorStyle === 'bar' ? '2px' : s.cursorStyle === 'underline' ? '0.6em' : '0.6em',
                    height: s.cursorStyle === 'underline' ? '2px' : '1em',
                    verticalAlign: s.cursorStyle === 'underline' ? 'bottom' : 'text-bottom',
                    background: COLOR_SCHEMES.find(c => c.name === s.colorScheme)?.accent ?? '#00d5ff',
                    opacity: 0.9,
                  }} />
                </div>
              </div>
            </div>
          )}

          {/* ── AI ────────────────────────────────────────────────────────── */}
          {activeTab === 'ai' && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-200">
              <Section title="Model">
                <SelectRow
                  label="Default Model"
                  value={s.aiModel}
                  onChange={(v) => s.updateSetting('aiModel', v)}
                  options={[
                    { value: 'Claude 3.5 Sonnet', label: 'Claude 3.5 Sonnet' },
                    { value: 'Claude 3 Opus', label: 'Claude 3 Opus' },
                    { value: 'Claude 3 Haiku', label: 'Claude 3 Haiku' },
                    { value: 'GPT-4o', label: 'GPT-4o' },
                    { value: 'GPT-4o mini', label: 'GPT-4o mini' },
                    { value: 'Gemini 1.5 Pro', label: 'Gemini 1.5 Pro' },
                    { value: 'Gemini 1.5 Flash', label: 'Gemini 1.5 Flash' },
                  ]}
                />
              </Section>

              <div className="h-px bg-border" />

              <Section title="Authentication">
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1.5">API Key</label>
                  <input
                    type="password"
                    placeholder="sk-ant-..."
                    data-testid="input-api-key"
                    className="w-full bg-secondary border border-border rounded-md px-3 py-2 text-sm font-mono text-foreground focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none"
                  />
                  <p className="text-xs text-muted-foreground mt-1.5">Stored in your system keychain. Never sent to third parties.</p>
                </div>
              </Section>
            </div>
          )}

          {/* ── SHORTCUTS ─────────────────────────────────────────────────── */}
          {activeTab === 'shortcuts' && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-200">
              <Section title="Keybindings">
                <div className="border border-border rounded-lg bg-card overflow-hidden divide-y divide-border">
                  {Object.entries(s.keyboardShortcuts).map(([action, keys]) => {
                    const isRemapping = remapping === action;
                    return (
                      <div
                        key={action}
                        className="flex items-center justify-between px-4 py-3 hover:bg-secondary/30 transition-colors"
                        data-testid={`shortcut-${action}`}
                      >
                        <span className="text-sm text-foreground">
                          {action
                            .replace(/([A-Z])/g, ' $1')
                            .replace(/^./, (s) => s.toUpperCase())
                            .trim()}
                        </span>
                        <button
                          onClick={() => setRemapping(isRemapping ? null : action)}
                          className={`px-2.5 py-1 rounded border text-xs font-mono transition-all ${
                            isRemapping
                              ? 'border-primary text-primary bg-primary/10 animate-pulse'
                              : 'border-border text-muted-foreground bg-secondary hover:border-muted-foreground/50'
                          }`}
                        >
                          {isRemapping ? 'press a key…' : keys}
                        </button>
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs text-muted-foreground">
                  Click a binding to remap it. Shortcut changes apply immediately.
                </p>
              </Section>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

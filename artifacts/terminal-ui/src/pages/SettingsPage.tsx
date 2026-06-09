import React, { useState } from 'react';
import { useSettingsStore } from '@/stores/settingsStore';

export function SettingsPage() {
  const settings = useSettingsStore();
  const [activeTab, setActiveTab] = useState<'appearance' | 'terminal' | 'ai' | 'shortcuts'>('appearance');

  const tabs = [
    { id: 'appearance', label: 'Appearance' },
    { id: 'terminal', label: 'Terminal' },
    { id: 'ai', label: 'AI Assistant' },
    { id: 'shortcuts', label: 'Keyboard Shortcuts' },
  ] as const;

  return (
    <div className="flex h-full w-full bg-background overflow-hidden">
      {/* Settings Sidebar */}
      <div className="w-64 border-r border-border bg-card/50 flex flex-col p-4 shrink-0">
        <h2 className="text-xl font-bold text-foreground mb-6 px-2">Settings</h2>
        <div className="space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === tab.id ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Settings Content */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-2xl">
          {activeTab === 'appearance' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4">Theme</h3>
                <div className="grid grid-cols-3 gap-4">
                  {(['dark', 'light', 'system'] as const).map((t) => (
                    <div 
                      key={t}
                      onClick={() => settings.updateSetting('theme', t)}
                      className={`border rounded-lg p-4 cursor-pointer text-center capitalize transition-colors ${
                        settings.theme === t ? 'border-primary bg-primary/5' : 'border-border bg-card hover:border-muted-foreground'
                      }`}
                    >
                      <div className={`w-full h-16 rounded mb-2 ${
                        t === 'dark' ? 'bg-[#141517]' : t === 'light' ? 'bg-[#f4f4f5]' : 'bg-gradient-to-r from-[#141517] to-[#f4f4f5]'
                      }`} />
                      <span className={`text-sm font-medium ${settings.theme === t ? 'text-primary' : 'text-foreground'}`}>{t}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4">Typography</h3>
                <div className="space-y-6">
                  <div>
                    <label className="text-sm font-medium text-foreground block mb-2">Font Family</label>
                    <select 
                      value={settings.fontFamily}
                      onChange={(e) => settings.updateSetting('fontFamily', e.target.value)}
                      className="w-full bg-secondary border border-border rounded-md px-3 py-2 text-sm text-foreground focus:border-primary outline-none"
                    >
                      <option value="JetBrains Mono">JetBrains Mono</option>
                      <option value="Fira Code">Fira Code</option>
                      <option value="Menlo">Menlo</option>
                      <option value="Monaco">Monaco</option>
                    </select>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-foreground block">Font Size</label>
                      <span className="text-sm text-muted-foreground">{settings.fontSize}px</span>
                    </div>
                    <input 
                      type="range" 
                      min="10" 
                      max="24" 
                      value={settings.fontSize}
                      onChange={(e) => settings.updateSetting('fontSize', parseInt(e.target.value))}
                      className="w-full accent-primary"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4">Window</h3>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-foreground block">Background Opacity</label>
                    <span className="text-sm text-muted-foreground">{settings.opacity}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="50" 
                    max="100" 
                    value={settings.opacity}
                    onChange={(e) => settings.updateSetting('opacity', parseInt(e.target.value))}
                    className="w-full accent-primary"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'terminal' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4">Shell Integration</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground block mb-2">Shell Path</label>
                    <input 
                      type="text" 
                      value={settings.shellPath}
                      onChange={(e) => settings.updateSetting('shellPath', e.target.value)}
                      className="w-full bg-secondary border border-border rounded-md px-3 py-2 text-sm font-mono text-foreground focus:border-primary outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ai' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4">Model Configuration</h3>
                <div className="space-y-6">
                  <div>
                    <label className="text-sm font-medium text-foreground block mb-2">Default Model</label>
                    <select 
                      value={settings.aiModel}
                      onChange={(e) => settings.updateSetting('aiModel', e.target.value)}
                      className="w-full bg-secondary border border-border rounded-md px-3 py-2 text-sm text-foreground focus:border-primary outline-none"
                    >
                      <option value="Claude 3.5 Sonnet">Claude 3.5 Sonnet</option>
                      <option value="GPT-4o">GPT-4o</option>
                      <option value="Gemini 1.5 Pro">Gemini 1.5 Pro</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground block mb-2">API Key</label>
                    <input 
                      type="password" 
                      placeholder="sk-..."
                      className="w-full bg-secondary border border-border rounded-md px-3 py-2 text-sm text-foreground focus:border-primary outline-none"
                    />
                    <p className="text-xs text-muted-foreground mt-2">Stored securely in your system keychain.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'shortcuts' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4">Keybindings</h3>
                <div className="border border-border rounded-lg bg-card overflow-hidden">
                  {Object.entries(settings.keyboardShortcuts).map(([action, keys], idx, arr) => (
                    <div key={action} className={`flex items-center justify-between p-4 ${idx !== arr.length - 1 ? 'border-b border-border' : ''}`}>
                      <span className="text-sm font-medium text-foreground capitalize">{action.replace(/([A-Z])/g, ' $1').trim()}</span>
                      <kbd className="px-2 py-1 bg-secondary border border-border rounded text-xs font-mono text-muted-foreground">{keys}</kbd>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

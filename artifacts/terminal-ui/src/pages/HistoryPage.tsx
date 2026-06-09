import React, { useState } from 'react';
import { Search, Filter, ArrowUpDown } from 'lucide-react';
import { useTerminalStore } from '@/stores/terminalStore';

export function HistoryPage() {
  const { commandBlocks } = useTerminalStore();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'success' | 'error'>('all');

  // Generate more mock history based on the few blocks we have
  const mockHistory = Array.from({ length: 25 }).map((_, i) => {
    const template = commandBlocks[i % commandBlocks.length];
    return {
      ...template,
      id: `hist-${i}`,
      timestamp: new Date(Date.now() - Math.random() * 86400000), // Random time within last 24h
    };
  }).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  const filteredHistory = mockHistory.filter(h => {
    if (filter !== 'all' && h.status !== filter) return false;
    if (search && !h.command.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const formatTime = (date: Date) => {
    const diff = (Date.now() - date.getTime()) / 1000;
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    return date.toLocaleDateString();
  };

  const formatDuration = (ms: number | null) => {
    if (ms === null) return '-';
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  return (
    <div className="flex flex-col h-full w-full bg-background overflow-hidden p-6">
      <div className="flex items-center justify-between mb-6 shrink-0">
        <h1 className="text-2xl font-bold text-foreground">Command History</h1>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search commands..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-secondary/50 border border-border rounded-md py-1.5 pl-9 pr-4 text-sm outline-none focus:border-primary transition-colors w-64 text-foreground"
            />
          </div>
          <div className="flex items-center bg-secondary/50 border border-border rounded-md p-1">
            {(['all', 'success', 'error'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 text-xs font-medium rounded-sm capitalize transition-colors ${
                  filter === f ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto border border-border rounded-lg bg-card">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-muted-foreground bg-secondary/30 sticky top-0 border-b border-border shadow-sm">
            <tr>
              <th className="px-4 py-3 font-semibold w-1/3">Command</th>
              <th className="px-4 py-3 font-semibold">Directory</th>
              <th className="px-4 py-3 font-semibold w-32 cursor-pointer hover:text-foreground">
                <div className="flex items-center gap-1">Time <ArrowUpDown size={12} /></div>
              </th>
              <th className="px-4 py-3 font-semibold w-24">Status</th>
              <th className="px-4 py-3 font-semibold w-24">Duration</th>
            </tr>
          </thead>
          <tbody>
            {filteredHistory.map((cmd) => (
              <tr key={cmd.id} className="border-b border-border/50 hover:bg-secondary/20 cursor-pointer transition-colors group">
                <td className="px-4 py-3 font-mono text-foreground truncate max-w-[200px]">{cmd.command}</td>
                <td className="px-4 py-3 font-mono text-muted-foreground truncate max-w-[200px]">{cmd.workingDir}</td>
                <td className="px-4 py-3 text-muted-foreground">{formatTime(cmd.timestamp)}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                    cmd.status === 'success' ? 'bg-success/20 text-success' : 'bg-destructive/20 text-destructive'
                  }`}>
                    {cmd.status === 'success' ? '0' : cmd.exitCode}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{formatDuration(cmd.duration)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

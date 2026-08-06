import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Terminal,
  Settings,
  PlaySquare,
  GitBranch,
  History,
  Bot,
  ChevronUp,
  ChevronDown,
  Trash2,
  Send,
} from "lucide-react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";

interface CommandItem {
  id: string;
  name: string;
  group: string;
  icon: React.ElementType;
  shortcut?: string;
  action: () => void | Promise<void>;
}

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [ptyOutput, setPtyOutput] = useState<string[]>([]);
  const [showTerminalDrawer, setShowTerminalDrawer] = useState(false);
  const [customCommand, setCustomCommand] = useState("");

  const inputRef = useRef<HTMLInputElement>(null);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Helper to send a shell command to Rust backend
  const executePtyCommand = async (command: string) => {
    try {
      // Auto-open terminal drawer when executing terminal commands
      setShowTerminalDrawer(true);
      await invoke("write_pty", { command });
    } catch (err) {
      console.error("Failed to write to PTY:", err);
      setPtyOutput((prev) => [
        ...prev,
        `[ERROR]: Failed to write command: ${err}\n`,
      ]);
    }
  };

  // 1. Setup Global Shortcut (Cmd+K / Ctrl+K), Event Listeners & Start PTY
  useEffect(() => {
    let unlistenOutput: () => void;
    let unlistenClosed: () => void;

    async function initPty() {
      try {
        // Listen for output streaming from Rust (pty-output event)
        unlistenOutput = await listen<string>("pty-output", (event) => {
          setPtyOutput((prev) => [...prev.slice(-200), event.payload]); // Keep last 200 chunks
        });

        // Listen for session closed event
        unlistenClosed = await listen<string>("pty-closed", (event) => {
          setPtyOutput((prev) => [...prev, "\n[SESSION CLOSED]\n"]);
        });

        // Initialize the PTY process in Rust
        await invoke("start_pty");
      } catch (err) {
        console.error("Error initializing PTY:", err);
      }
    }

    initPty();

    // Global Keydown Handler for Cmd+K / Ctrl+K
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };

    const handleToggle = () => setIsOpen((prev) => !prev);
    const handleClose = () => setIsOpen(false);

    window.addEventListener("keydown", handleGlobalKeyDown);
    document.addEventListener("toggle-command-palette", handleToggle);
    document.addEventListener("close-modals", handleClose);

    return () => {
      if (unlistenOutput) unlistenOutput();
      if (unlistenClosed) unlistenClosed();
      window.removeEventListener("keydown", handleGlobalKeyDown);
      document.removeEventListener("toggle-command-palette", handleToggle);
      document.removeEventListener("close-modals", handleClose);
    };
  }, []);

  // 2. Auto-scroll terminal output drawer to bottom
  useEffect(() => {
    if (showTerminalDrawer) {
      terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [ptyOutput, showTerminalDrawer]);

  // 3. Focus input when palette opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSearch("");
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // 4. Command definitions with active Tauri bindings
  const commands: CommandItem[] = [
    {
      id: "1",
      group: "Navigation",
      name: "Go to Terminal",
      icon: Terminal,
      action: () => {
        setShowTerminalDrawer(true);
        document.dispatchEvent(new CustomEvent("navigate-terminal"));
      },
    },
    {
      id: "2",
      group: "Navigation",
      name: "Go to History",
      icon: History,
      action: () => document.dispatchEvent(new CustomEvent("navigate-history")),
    },
    {
      id: "3",
      group: "Navigation",
      name: "Go to Workflows",
      icon: PlaySquare,
      action: () =>
        document.dispatchEvent(new CustomEvent("navigate-workflows")),
    },
    {
      id: "4",
      group: "Navigation",
      name: "Go to Settings",
      icon: Settings,
      shortcut: "⌘,",
      action: () =>
        document.dispatchEvent(new CustomEvent("navigate-settings")),
    },
    {
      id: "5",
      group: "Actions",
      name: "Toggle AI Panel",
      icon: Bot,
      shortcut: "⌘⇧A",
      action: () => document.dispatchEvent(new CustomEvent("toggle-ai-panel")),
    },
    {
      id: "6",
      group: "Actions",
      name: "Clear Terminal Output",
      icon: Trash2,
      shortcut: "⌘K",
      action: () => setPtyOutput([]),
    },
    {
      id: "7",
      group: "Workflows",
      name: "Run Dev Server (npm run dev)",
      icon: PlaySquare,
      action: () => executePtyCommand("npm run dev"),
    },
    {
      id: "8",
      group: "Workflows",
      name: "Build Production (npm run build)",
      icon: PlaySquare,
      action: () => executePtyCommand("npm run build"),
    },
    {
      id: "9",
      group: "Recent Commands",
      name: "cargo build",
      icon: Terminal,
      action: () => executePtyCommand("cargo build"),
    },
    {
      id: "10",
      group: "Recent Commands",
      name: "git status",
      icon: GitBranch,
      action: () => executePtyCommand("git status"),
    },
    {
      id: "11",
      group: "Recent Commands",
      name: "npm install",
      icon: Terminal,
      action: () => executePtyCommand("npm install"),
    },
  ];

  const filteredCommands = search
    ? commands.filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.group.toLowerCase().includes(search.toLowerCase()),
      )
    : commands;

  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filteredCommands.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(
        (prev) =>
          (prev - 1 + filteredCommands.length) % filteredCommands.length,
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      const cmd = filteredCommands[selectedIndex];
      if (cmd) {
        cmd.action();
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const handleCustomCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customCommand.trim()) {
      executePtyCommand(customCommand.trim());
      setCustomCommand("");
    }
  };

  const groups = Array.from(new Set(filteredCommands.map((c) => c.group)));

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
            onClick={() => setIsOpen(false)}
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] pointer-events-none px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.15 }}
              className="bg-card w-full max-w-2xl border border-border shadow-2xl rounded-xl overflow-hidden pointer-events-auto flex flex-col max-h-[80vh]"
            >
              {/* Search Bar */}
              <div className="flex items-center border-b border-border px-4 py-3 shrink-0">
                <Search
                  size={18}
                  className="text-muted-foreground mr-3 shrink-0"
                />
                <input
                  ref={inputRef}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a command or search..."
                  className="w-full bg-transparent outline-none text-foreground placeholder:text-muted-foreground text-sm"
                />
                <span className="text-[10px] font-medium text-muted-foreground border border-border rounded px-1.5 py-0.5 ml-2">
                  ESC
                </span>
              </div>

              {/* Command List */}
              <div className="overflow-y-auto p-2 flex-1">
                {filteredCommands.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground text-sm">
                    No results found for "{search}"
                  </div>
                ) : (
                  groups.map((group) => (
                    <div key={group} className="mb-4 last:mb-0">
                      <div className="px-3 py-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                        {group}
                      </div>
                      <div className="space-y-1">
                        {filteredCommands
                          .filter((c) => c.group === group)
                          .map((cmd) => {
                            const globalIndex = filteredCommands.findIndex(
                              (c) => c.id === cmd.id,
                            );
                            const isSelected = globalIndex === selectedIndex;
                            const Icon = cmd.icon;

                            return (
                              <div
                                key={cmd.id}
                                className={`flex items-center justify-between px-3 py-2 rounded-md cursor-pointer transition-colors ${
                                  isSelected
                                    ? "bg-primary text-primary-foreground"
                                    : "text-foreground hover:bg-secondary"
                                }`}
                                onClick={() => cmd.action()}
                                onMouseEnter={() =>
                                  setSelectedIndex(globalIndex)
                                }
                              >
                                <div className="flex items-center gap-3">
                                  <Icon
                                    size={16}
                                    className={
                                      isSelected
                                        ? "text-primary-foreground"
                                        : "text-muted-foreground"
                                    }
                                  />
                                  <span className="text-sm font-medium">
                                    {cmd.name}
                                  </span>
                                </div>
                                {cmd.shortcut && (
                                  <span
                                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                                      isSelected
                                        ? "bg-primary-foreground/20 text-primary-foreground"
                                        : "bg-secondary text-muted-foreground"
                                    }`}
                                  >
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

              {/* Real-time PTY Terminal Drawer (For Live Testing) */}
              <div className="border-t border-border bg-black/40">
                <div
                  className="flex items-center justify-between px-4 py-2 cursor-pointer hover:bg-secondary/50 transition-colors"
                  onClick={() => setShowTerminalDrawer((prev) => !prev)}
                >
                  <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
                    <Terminal size={14} className="text-green-500" />
                    <span>
                      Live PTY Stream ({ptyOutput.length} output chunks)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPtyOutput([]);
                      }}
                      className="p-1 hover:text-destructive transition-colors text-muted-foreground"
                      title="Clear terminal logs"
                    >
                      <Trash2 size={13} />
                    </button>
                    {showTerminalDrawer ? (
                      <ChevronDown
                        size={14}
                        className="text-muted-foreground"
                      />
                    ) : (
                      <ChevronUp size={14} className="text-muted-foreground" />
                    )}
                  </div>
                </div>

                {showTerminalDrawer && (
                  <div className="p-3 border-t border-border flex flex-col gap-2">
                    {/* Console View */}
                    <div className="bg-black/80 font-mono text-xs text-green-400 p-3 rounded-md h-40 overflow-y-auto whitespace-pre-wrap break-words border border-border/50 selection:bg-green-900">
                      {ptyOutput.length === 0 ? (
                        <span className="text-zinc-600 italic">
                          Waiting for command execution...
                        </span>
                      ) : (
                        ptyOutput.join("")
                      )}
                      <div ref={terminalEndRef} />
                    </div>

                    {/* Quick Command Execution Input */}
                    <form
                      onSubmit={handleCustomCommandSubmit}
                      className="flex items-center gap-2"
                    >
                      <input
                        type="text"
                        value={customCommand}
                        onChange={(e) => setCustomCommand(e.target.value)}
                        placeholder="Type raw shell command (e.g. dir, ls -la, echo hello)..."
                        className="flex-1 bg-black/50 border border-border rounded px-3 py-1.5 text-xs font-mono text-foreground focus:outline-none focus:border-primary"
                      />
                      <button
                        type="submit"
                        className="bg-primary text-primary-foreground text-xs px-3 py-1.5 rounded flex items-center gap-1 font-medium hover:opacity-90"
                      >
                        <Send size={12} /> Send
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

# Warp-Inspired Terminal UI

A modern AI-native terminal application frontend inspired by Warp, Cursor, and Claude Code. Full desktop-style layout with command blocks, AI assistant panel, command palette, history, workflows, and settings.

## Run & Operate

- `pnpm --filter @workspace/terminal-ui run dev` — run the terminal UI (port assigned by workflow)
- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + TailwindCSS + shadcn/ui
- Terminal: xterm.js with FitAddon, WebLinksAddon
- State: Zustand stores (terminal, workspace, ai, settings)
- Animation: framer-motion
- Layout: react-resizable-panels
- API: Express 5 (api-server artifact, not used by terminal UI)
- DB: PostgreSQL + Drizzle ORM (not yet used)

## Where things live

- `artifacts/terminal-ui/src/` — all frontend source
- `artifacts/terminal-ui/src/services/tauri/` — Tauri IPC abstraction layer (mock implementations)
- `artifacts/terminal-ui/src/stores/` — Zustand state stores
- `artifacts/terminal-ui/src/components/terminal/` — xterm.js wrapper + command blocks
- `artifacts/terminal-ui/src/components/sidebar/` — collapsible sidebar
- `artifacts/terminal-ui/src/components/ai/` — AI assistant panel
- `artifacts/terminal-ui/src/components/command-palette/` — Ctrl+P palette
- `artifacts/terminal-ui/src/pages/` — Terminal, History, Workflows, Settings pages

## Architecture decisions

- **No backend calls from the UI** — all communication is abstracted behind `src/services/tauri/` service interfaces. When the Rust backend is ready, only the service layer changes.
- **Mock-first** — services simulate Tauri `invoke()` and `listen()` with realistic mock data so the UI is fully interactive without a backend.
- **Zustand for state** — four stores: terminalStore (command blocks), workspaceStore (projects), aiStore (chat), settingsStore (user prefs).
- **xterm.js** — real terminal emulator embedded in the workspace view, themed to match the app palette.
- **Keyboard-first** — Ctrl+P (command palette), Ctrl+Shift+A (AI panel), Ctrl+B (sidebar toggle), Esc (close overlays).

## Product

- Terminal Workspace: xterm.js emulator + scrollable command block history with status, duration, exit codes
- Left Sidebar: collapsible to icon rail, project/history/workflow/AI navigation
- AI Assistant Panel: right-side drawer with chat, suggested actions, Claude model badge
- Command Palette: Ctrl+P overlay with grouped search across commands, workflows, settings
- History View: sortable/filterable table of all past commands
- Workflows View: card grid of saved multi-step command workflows
- Settings: appearance, terminal, AI, keyboard shortcuts configuration
- Status Bar: workspace, git branch, backend status, active model, latency

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- The Tauri service layer in `src/services/tauri/` uses mock implementations. Do NOT replace with direct Tauri API calls — always go through the service interfaces.
- xterm.js requires `import 'xterm/css/xterm.css'` to render correctly.
- Google Fonts `@import url(...)` MUST be the very first line in index.css before `@import "tailwindcss"`.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details

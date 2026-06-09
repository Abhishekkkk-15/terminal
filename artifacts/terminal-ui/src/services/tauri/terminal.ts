import { eventBus } from './events';

// ─── PTY state ───────────────────────────────────────────────────────────────
// When the Rust backend is ready, replace this entire module with real
// invoke("write_terminal") / invoke("resize_terminal") calls.

let cwd = '~/projects/terminal-ui';
let gitBranch: string | null = 'feature/terminal';
let inputBuffer = '';
let cursorPos = 0;
const commandHistory: string[] = [];
let historyIndex = -1;

// ─── Helpers ─────────────────────────────────────────────────────────────────

const write = (data: string) => eventBus.emit('terminal-output', { data });
const writeln = (line: string) => write(line + '\r\n');

const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';
const DIM = '\x1b[2m';
const GREEN = '\x1b[38;5;114m';
const CYAN = '\x1b[38;5;51m';
const BLUE = '\x1b[38;5;75m';
const PURPLE = '\x1b[38;5;141m';
const ORANGE = '\x1b[38;5;203m';
const YELLOW = '\x1b[38;5;221m';
const RED = '\x1b[38;5;196m';
const GRAY = '\x1b[38;5;244m';

function prompt(): void {
  const branch = gitBranch
    ? ` ${PURPLE}git:(${ORANGE}${gitBranch}${PURPLE})${RESET}`
    : '';
  write(`${GREEN}${cwd}${RESET}${branch} ${BOLD}${CYAN}$${RESET} `);
}

function clearLine(): void {
  // Move to column 0, erase line
  write('\r\x1b[2K');
  // Reprint prompt + current buffer with cursor placed correctly
  const branch = gitBranch
    ? ` ${PURPLE}git:(${ORANGE}${gitBranch}${PURPLE})${RESET}`
    : '';
  const promptStr = `${GREEN}${cwd}${RESET}${branch} ${BOLD}${CYAN}$${RESET} `;
  write(promptStr + inputBuffer);
  // Move cursor back to cursorPos
  if (cursorPos < inputBuffer.length) {
    write(`\x1b[${inputBuffer.length - cursorPos}D`);
  }
}

// ─── Mock filesystem ─────────────────────────────────────────────────────────

const FS: Record<string, string[]> = {
  '~/projects/terminal-ui': [
    'src/', 'public/', 'node_modules/', 'package.json', 'tsconfig.json',
    'vite.config.ts', 'tailwind.config.ts', 'index.html', '.gitignore',
    'README.md',
  ],
  '~/projects/terminal-ui/src': [
    'App.tsx', 'main.tsx', 'index.css', 'components/', 'pages/',
    'services/', 'stores/', 'hooks/', 'lib/', 'types/',
  ],
  '~/projects/core-backend': [
    'src/', 'target/', 'Cargo.toml', 'Cargo.lock', '.gitignore', 'README.md',
  ],
  '~/projects/core-backend/src': [
    'main.rs', 'terminal.rs', 'pty.rs', 'ipc.rs', 'workspace.rs',
  ],
  '~': ['projects/', 'Documents/', 'Downloads/', '.bashrc', '.zshrc'],
};

function getDir(path: string): string[] {
  return FS[path] ?? ['<empty directory>'];
}

// ─── Command handlers ────────────────────────────────────────────────────────

type CommandFn = (args: string[]) => { exitCode: number; output: string[] };

let pendingOutput: string[] = [];

function collectOutput(fn: () => void): string[] {
  const prev = pendingOutput;
  pendingOutput = [];
  fn();
  const out = pendingOutput;
  pendingOutput = prev;
  return out;
}

function col(text: string, ...codes: string[]): string {
  return codes.join('') + text + RESET;
}

const COMMANDS: Record<string, CommandFn> = {
  help: () => {
    const lines = [
      col('Available commands:', BOLD, CYAN),
      '',
      `  ${col('ls', YELLOW)}           List directory contents`,
      `  ${col('ls -la', YELLOW)}       Long listing with hidden files`,
      `  ${col('pwd', YELLOW)}          Print working directory`,
      `  ${col('cd <dir>', YELLOW)}     Change directory`,
      `  ${col('echo <text>', YELLOW)}  Print text`,
      `  ${col('clear', YELLOW)}        Clear terminal`,
      `  ${col('history', YELLOW)}      Show command history`,
      `  ${col('cat <file>', YELLOW)}   Show file contents`,
      '',
      col('  Git commands:', DIM),
      `  ${col('git status', YELLOW)}, ${col('git log', YELLOW)}, ${col('git branch', YELLOW)}, ${col('git diff', YELLOW)}`,
      `  ${col('git add', YELLOW)}, ${col('git commit', YELLOW)}, ${col('git push', YELLOW)}, ${col('git pull', YELLOW)}`,
      '',
      col('  Rust (cargo):', DIM),
      `  ${col('cargo build', YELLOW)}, ${col('cargo run', YELLOW)}, ${col('cargo test', YELLOW)}, ${col('cargo check', YELLOW)}`,
      '',
      col('  Node/npm:', DIM),
      `  ${col('npm install', YELLOW)}, ${col('npm run dev', YELLOW)}, ${col('npm test', YELLOW)}, ${col('npm run build', YELLOW)}`,
      '',
    ];
    return { exitCode: 0, output: lines };
  },

  ls: (args) => {
    const long = args.includes('-la') || args.includes('-l') || args.includes('-a');
    const entries = getDir(cwd);
    if (long) {
      const now = new Date();
      const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
      const lines = [
        `${GRAY}total ${entries.length * 4}${RESET}`,
        `${GRAY}drwxr-xr-x  ${entries.length + 2} user staff  ${col('160', BLUE)}  ${dateStr} ${col('.', GREEN)}${RESET}`,
        `${GRAY}drwxr-xr-x  8 user staff  ${col('256', BLUE)}  ${dateStr} ${col('..', GREEN)}${RESET}`,
        ...(long ? [
          `${GRAY}-rw-r--r--  1 user staff  ${col('  4', BLUE)}  ${dateStr} ${col('.gitignore', GRAY)}${RESET}`,
        ] : []),
        ...entries
          .filter(e => long || !e.startsWith('.'))
          .map(e => {
            const isDir = e.endsWith('/');
            const size = isDir ? ' 128' : `  ${Math.floor(Math.random() * 90 + 10)}`;
            const name = isDir
              ? `${BOLD}${BLUE}${e}${RESET}`
              : e.endsWith('.ts') || e.endsWith('.tsx')
                ? `${CYAN}${e}${RESET}`
                : e.endsWith('.json') || e.endsWith('.toml')
                  ? `${YELLOW}${e}${RESET}`
                  : e.endsWith('.md')
                    ? `${GREEN}${e}${RESET}`
                    : e;
            return `${GRAY}${isDir ? 'drwxr-xr-x' : '-rw-r--r--'}  1 user staff ${col(size, BLUE)}  ${dateStr} ${name}`;
          }),
      ];
      return { exitCode: 0, output: lines };
    }
    // Short listing: 4 per row
    const colored = entries.map(e =>
      e.endsWith('/')
        ? `${BOLD}${BLUE}${e.padEnd(22)}${RESET}`
        : e.endsWith('.ts') || e.endsWith('.tsx')
          ? `${CYAN}${e.padEnd(22)}${RESET}`
          : `${e.padEnd(22)}`
    );
    const rows: string[] = [];
    for (let i = 0; i < colored.length; i += 4) {
      rows.push(colored.slice(i, i + 4).join(''));
    }
    return { exitCode: 0, output: rows };
  },

  pwd: () => ({
    exitCode: 0,
    output: [cwd.replace('~', '/home/user')],
  }),

  cd: (args) => {
    const target = args[0];
    if (!target || target === '~') {
      cwd = '~';
      return { exitCode: 0, output: [] };
    }
    if (target === '..') {
      const parts = cwd.split('/');
      parts.pop();
      cwd = parts.join('/') || '~';
      return { exitCode: 0, output: [] };
    }
    const absolute = target.startsWith('~') || target.startsWith('/')
      ? target
      : `${cwd}/${target.replace(/\/$/, '')}`;
    const normalised = absolute.replace(/\/\.$/, '');
    if (FS[normalised]) {
      cwd = normalised;
      return { exitCode: 0, output: [] };
    }
    return {
      exitCode: 1,
      output: [`${col('cd:', RED)} ${target}: No such file or directory`],
    };
  },

  echo: (args) => ({
    exitCode: 0,
    output: [args.join(' ')],
  }),

  clear: () => {
    write('\x1b[2J\x1b[H');
    return { exitCode: 0, output: [] };
  },

  history: () => ({
    exitCode: 0,
    output: commandHistory.map((cmd, i) =>
      `  ${col(String(i + 1).padStart(3), GRAY)}  ${cmd}`
    ),
  }),

  cat: (args) => {
    if (!args[0]) return { exitCode: 1, output: [`${col('cat:', RED)} missing file operand`] };
    const file = args[0];
    const catContents: Record<string, string[]> = {
      'package.json': [
        '{',
        `  ${col('"name"', CYAN)}: ${col('"@workspace/terminal-ui"', GREEN)},`,
        `  ${col('"version"', CYAN)}: ${col('"0.0.0"', GREEN)},`,
        `  ${col('"scripts"', CYAN)}: {`,
        `    ${col('"dev"', CYAN)}: ${col('"vite --host 0.0.0.0"', GREEN)},`,
        `    ${col('"build"', CYAN)}: ${col('"vite build"', GREEN)}`,
        '  }',
        '}',
      ],
      'Cargo.toml': [
        `${col('[package]', PURPLE)}`,
        `${col('name', CYAN)} = ${col('"core-backend"', GREEN)}`,
        `${col('version', CYAN)} = ${col('"0.1.0"', GREEN)}`,
        `${col('edition', CYAN)} = ${col('"2021"', GREEN)}`,
        '',
        `${col('[dependencies]', PURPLE)}`,
        `${col('tauri', CYAN)} = { version = ${col('"2"', GREEN)}, features = [] }`,
        `${col('serde', CYAN)} = { version = ${col('"1"', GREEN)}, features = ["derive"] }`,
        `${col('tokio', CYAN)} = { version = ${col('"1"', GREEN)}, features = ["full"] }`,
      ],
      'README.md': [
        col('# Terminal UI', BOLD + CYAN),
        '',
        'A Warp-inspired terminal emulator frontend.',
        '',
        col('## Stack', BOLD),
        '- React + TypeScript + Vite',
        '- xterm.js for terminal emulation',
        '- Zustand for state management',
        '- Tauri IPC abstractions (mock)',
      ],
    };
    const content = catContents[file];
    if (!content) {
      return { exitCode: 1, output: [`${col('cat:', RED)} ${file}: No such file or directory`] };
    }
    return { exitCode: 0, output: content };
  },

  // ── Git ──────────────────────────────────────────────────────────────────

  git: (args) => {
    const sub = args[0];
    if (!sub) return { exitCode: 1, output: [`${col('usage:', YELLOW)} git <command> [<args>]`] };

    if (sub === 'status') {
      return {
        exitCode: 0,
        output: [
          `On branch ${col(gitBranch ?? 'main', PURPLE)}`,
          `Your branch is up to date with ${col(`'origin/${gitBranch ?? 'main'}'`, CYAN)}.`,
          '',
          col('Changes not staged for commit:', RED),
          `  (use ${col('"git add <file>..."', YELLOW)} to update what will be committed)`,
          '',
          `\t${col('modified:', RED)}   src/components/terminal/XtermTerminal.tsx`,
          `\t${col('modified:', RED)}   src/services/tauri/terminal.ts`,
          `\t${col('modified:', RED)}   src/services/tauri/events.ts`,
          '',
          `no changes added to commit (use ${col('"git add"', YELLOW)} and/or ${col('"git commit -a"', YELLOW)})`,
        ],
      };
    }

    if (sub === 'log') {
      const oneline = args.includes('--oneline');
      if (oneline) {
        return {
          exitCode: 0,
          output: [
            `${col('f8627748', YELLOW)} feat: add xterm.js service wiring`,
            `${col('a3c91d2e', YELLOW)} feat: add command palette and AI panel`,
            `${col('7b45fa12', YELLOW)} feat: implement zustand stores`,
            `${col('3e8c0a9f', YELLOW)} feat: initial terminal UI scaffold`,
            `${col('1d204b77', YELLOW)} chore: project setup`,
          ],
        };
      }
      return {
        exitCode: 0,
        output: [
          `${col('commit f8627748dd29624a7db7b6d1d64e5147db89d7c4', YELLOW)}`,
          `Author: Developer <dev@example.com>`,
          `Date:   ${new Date().toDateString()}`,
          '',
          `    feat: add xterm.js service wiring`,
          '',
          `${col('commit a3c91d2ec44a8f3b1d6e9c5072f84a1b90c7e283', YELLOW)}`,
          `Author: Developer <dev@example.com>`,
          `Date:   ${new Date(Date.now() - 86400000).toDateString()}`,
          '',
          `    feat: add command palette and AI panel`,
        ],
      };
    }

    if (sub === 'branch') {
      if (args[1] && !args[1].startsWith('-')) {
        const newBranch = args[1];
        gitBranch = newBranch;
        return { exitCode: 0, output: [`Switched to a new branch '${col(newBranch, GREEN)}'`] };
      }
      return {
        exitCode: 0,
        output: [
          `  ${col('main', RESET)}`,
          `* ${col(gitBranch ?? 'main', GREEN)}`,
          `  ${col('feature/ai-panel', RESET)}`,
        ],
      };
    }

    if (sub === 'diff') {
      return {
        exitCode: 0,
        output: [
          `${col('diff --git a/src/services/tauri/terminal.ts b/src/services/tauri/terminal.ts', BOLD)}`,
          `${col('index 0a3f21b..e9c14d2 100644', GRAY)}`,
          `${col('--- a/src/services/tauri/terminal.ts', RED)}`,
          `${col('+++ b/src/services/tauri/terminal.ts', GREEN)}`,
          `${col('@@ -1,13 +1,80 @@', CYAN)}`,
          `${col('-// Mock stub', RED)}`,
          `${col('+// Full mock PTY implementation', GREEN)}`,
          `${col('+import { eventBus } from \'./events\';', GREEN)}`,
        ],
      };
    }

    if (sub === 'add') {
      return { exitCode: 0, output: [] };
    }

    if (sub === 'commit') {
      const msgIdx = args.indexOf('-m');
      const msg = msgIdx >= 0 ? args.slice(msgIdx + 1).join(' ').replace(/^['"]|['"]$/g, '') : 'update';
      return {
        exitCode: 0,
        output: [
          `[${col(gitBranch ?? 'main', PURPLE)} ${col('a1b2c3d', YELLOW)}] ${msg}`,
          ` 3 files changed, 142 insertions(+), 12 deletions(-)`,
        ],
      };
    }

    if (sub === 'push') {
      return {
        exitCode: 0,
        output: [
          `Enumerating objects: 5, done.`,
          `Counting objects: 100% (5/5), done.`,
          `Writing objects: 100% (3/3), 1.21 KiB | 1.21 MiB/s, done.`,
          `To github.com:user/terminal-ui.git`,
          `   a3c91d2..f862774  ${col(gitBranch ?? 'main', PURPLE)} -> ${col(gitBranch ?? 'main', PURPLE)}`,
        ],
      };
    }

    if (sub === 'pull') {
      return {
        exitCode: 0,
        output: [`Already up to date.`],
      };
    }

    if (sub === 'checkout') {
      const branch = args[1];
      if (branch) {
        gitBranch = branch;
        return { exitCode: 0, output: [`Switched to branch '${col(branch, GREEN)}'`] };
      }
    }

    if (sub === 'clone') {
      return {
        exitCode: 0,
        output: [
          `Cloning into '${args[1]?.split('/').pop()?.replace('.git', '') ?? 'repo'}'...`,
          `remote: Enumerating objects: 142, done.`,
          `Receiving objects: 100% (142/142), 84.3 KiB | 3.2 MiB/s, done.`,
        ],
      };
    }

    return {
      exitCode: 1,
      output: [`${col('git:', RED)} '${sub}' is not a git command`],
    };
  },

  // ── Cargo ────────────────────────────────────────────────────────────────

  cargo: (args) => {
    const sub = args[0];
    if (sub === 'build') {
      return {
        exitCode: 0,
        output: [
          `   ${col('Compiling', GREEN)} proc-macro2 v1.0.63`,
          `   ${col('Compiling', GREEN)} unicode-ident v1.0.10`,
          `   ${col('Compiling', GREEN)} quote v1.0.29`,
          `   ${col('Compiling', GREEN)} syn v2.0.25`,
          `   ${col('Compiling', GREEN)} serde_derive v1.0.163`,
          `   ${col('Compiling', GREEN)} serde v1.0.163`,
          `   ${col('Compiling', GREEN)} tokio-macros v2.1.0`,
          `   ${col('Compiling', GREEN)} tokio v1.28.2`,
          `   ${col('Compiling', GREEN)} core-backend v0.1.0 (~/projects/core-backend)`,
          `    ${col('Finished', GREEN)} dev [unoptimized + debuginfo] target(s) in 14.50s`,
        ],
      };
    }
    if (sub === 'check') {
      return {
        exitCode: 0,
        output: [
          `   ${col('Checking', GREEN)} core-backend v0.1.0`,
          `    ${col('Finished', GREEN)} dev [unoptimized + debuginfo] target(s) in 1.22s`,
        ],
      };
    }
    if (sub === 'test') {
      return {
        exitCode: 0,
        output: [
          `   ${col('Compiling', GREEN)} core-backend v0.1.0`,
          `    ${col('Finished', GREEN)} test [unoptimized + debuginfo] target(s) in 3.42s`,
          `     ${col('Running', CYAN)} unittests src/main.rs`,
          '',
          `running 4 tests`,
          `test pty::tests::test_resize ... ${col('ok', GREEN)}`,
          `test pty::tests::test_write  ... ${col('ok', GREEN)}`,
          `test ipc::tests::test_invoke ... ${col('ok', GREEN)}`,
          `test workspace::tests::test_open ... ${col('ok', GREEN)}`,
          '',
          `test result: ${col('ok', GREEN)}. 4 passed; 0 failed; 0 ignored; 0 measured`,
        ],
      };
    }
    if (sub === 'run') {
      return {
        exitCode: 0,
        output: [
          `   ${col('Compiling', GREEN)} core-backend v0.1.0`,
          `    ${col('Finished', GREEN)} dev [unoptimized + debuginfo] target(s) in 5.31s`,
          `     ${col('Running', CYAN)} target/debug/core-backend`,
          `[INFO]  Listening on ws://127.0.0.1:9001`,
        ],
      };
    }
    if (sub === 'clean') {
      return {
        exitCode: 0,
        output: [`     ${col('Removed', YELLOW)} target directory`],
      };
    }
    return {
      exitCode: 1,
      output: [`${col('error:', RED)} no subcommand '${sub}' for 'cargo'`],
    };
  },

  // ── npm ──────────────────────────────────────────────────────────────────

  npm: (args) => {
    const sub = args[0];
    const script = args[1];
    if (sub === 'install' || sub === 'i') {
      return {
        exitCode: 0,
        output: [
          ``,
          `added 342 packages, and audited 343 packages in 4s`,
          ``,
          `102 packages are looking for funding`,
          `  run ${col('npm fund', CYAN)} for details`,
          ``,
          `${col('found 0 vulnerabilities', GREEN)}`,
        ],
      };
    }
    if (sub === 'run') {
      if (script === 'dev') {
        return {
          exitCode: 0,
          output: [
            ``,
            `> terminal-ui@0.0.0 dev`,
            `> vite --host 0.0.0.0`,
            ``,
            `  ${col('VITE', CYAN)} v7.3.3  ready in 284 ms`,
            ``,
            `  ${col('➜', GREEN)}  Local:   ${col('http://localhost:5173/', CYAN)}`,
            `  ${col('➜', GREEN)}  Network: ${col('http://0.0.0.0:5173/', CYAN)}`,
          ],
        };
      }
      if (script === 'build') {
        return {
          exitCode: 0,
          output: [
            `> terminal-ui@0.0.0 build`,
            `> vite build`,
            ``,
            `${col('✓', GREEN)} 142 modules transformed.`,
            `dist/index.html    1.23 kB`,
            `dist/assets/index-Dx9kQ1aE.css   28.31 kB │ gzip:   5.80 kB`,
            `dist/assets/index-BrT2DKQL.js   401.45 kB │ gzip: 128.62 kB`,
            `${col('✓', GREEN)} built in 3.21s`,
          ],
        };
      }
      if (script === 'test') {
        return {
          exitCode: 0,
          output: [
            ` ${col('✓', GREEN)} src/stores/terminalStore.test.ts (3)`,
            ` ${col('✓', GREEN)} src/services/tauri/terminal.test.ts (5)`,
            ` ${col('✓', GREEN)} src/components/terminal/XtermTerminal.test.ts (4)`,
            ``,
            ` Test Files  ${col('3 passed', GREEN)} (3)`,
            `      Tests  ${col('12 passed', GREEN)} (12)`,
            `   Duration  ${col('1.42s', GRAY)}`,
          ],
        };
      }
    }
    if (sub === 'test') {
      return {
        exitCode: 0,
        output: [
          ` ${col('✓', GREEN)} 12 tests passed`,
          `   Duration  ${col('1.42s', GRAY)}`,
        ],
      };
    }
    return {
      exitCode: 1,
      output: [`${col('npm error', RED)} Unknown command: "${sub}"`],
    };
  },

  // ── node ─────────────────────────────────────────────────────────────────

  node: (args) => {
    if (!args[0]) {
      writeln(`Welcome to Node.js v20.11.0.`);
      writeln(`Type ${col('.exit', CYAN)} to exit the REPL.`);
      writeln(`> `);
      return { exitCode: 0, output: [] };
    }
    return { exitCode: 0, output: [`Running ${args[0]}...`] };
  },

  // ── misc ─────────────────────────────────────────────────────────────────

  which: (args) => {
    const known: Record<string, string> = {
      node: '/usr/local/bin/node',
      npm: '/usr/local/bin/npm',
      cargo: '/home/user/.cargo/bin/cargo',
      git: '/usr/bin/git',
      ls: '/bin/ls',
      pwd: '/bin/pwd',
    };
    const bin = known[args[0]];
    return bin
      ? { exitCode: 0, output: [bin] }
      : { exitCode: 1, output: [`${args[0]} not found`] };
  },

  env: () => ({
    exitCode: 0,
    output: [
      `${col('PATH', CYAN)}=/usr/local/bin:/usr/bin:/bin:/home/user/.cargo/bin`,
      `${col('HOME', CYAN)}=/home/user`,
      `${col('SHELL', CYAN)}=/bin/zsh`,
      `${col('TERM', CYAN)}=xterm-256color`,
      `${col('NODE_ENV', CYAN)}=development`,
    ],
  }),

  exit: () => {
    writeln('');
    writeln(col('Session ended. Close the terminal to exit.', GRAY));
    return { exitCode: 0, output: [] };
  },
};

// ─── Command dispatcher ───────────────────────────────────────────────────────

function processLine(line: string): void {
  const trimmed = line.trim();
  if (!trimmed) {
    prompt();
    return;
  }

  commandHistory.push(trimmed);
  historyIndex = commandHistory.length;

  const [cmd, ...args] = trimmed.split(/\s+/);

  // Emit lifecycle events so the Zustand store can track command blocks
  const id = `cmd-${Date.now()}`;
  const startTime = Date.now();
  eventBus.emit('command-started', {
    id,
    command: trimmed,
    workingDir: cwd,
    gitBranch,
  });

  const handler = COMMANDS[cmd];
  if (!handler) {
    const output = [
      `${col(`${cmd}:`, RED)} command not found`,
      `Try ${col('help', CYAN)} to see available commands.`,
    ];
    output.forEach((l) => writeln(l));
    eventBus.emit('command-finished', {
      id,
      exitCode: 127,
      duration: Date.now() - startTime,
      output,
    });
    prompt();
    return;
  }

  const result = handler(args);
  result.output.forEach((l) => writeln(l));

  eventBus.emit('command-finished', {
    id,
    exitCode: result.exitCode,
    duration: Date.now() - startTime,
    output: result.output,
  });

  if (cmd !== 'clear') {
    prompt();
  }
}

// ─── Public service interface ────────────────────────────────────────────────

export interface TerminalService {
  /** Send raw PTY input (keystrokes). Swap for invoke("write_terminal") with Rust. */
  writeTerminal: (data: string) => Promise<void>;
  /** Notify backend of viewport resize. Swap for invoke("resize_terminal") with Rust. */
  resizeTerminal: (cols: number, rows: number) => Promise<void>;
  /** Emit initial welcome message + first prompt. Call once on mount. */
  init: () => void;
}

export const terminalService: TerminalService = {
  writeTerminal: async (data: string) => {
    for (let i = 0; i < data.length; ) {
      const ch = data[i];
      const code = data.charCodeAt(i);

      // Escape sequences (arrow keys, etc.)
      if (ch === '\x1b' && data[i + 1] === '[') {
        const seq = data[i + 2];
        if (seq === 'A') {
          // Arrow up — history prev
          if (commandHistory.length > 0 && historyIndex > 0) {
            historyIndex--;
            inputBuffer = commandHistory[historyIndex];
            cursorPos = inputBuffer.length;
            clearLine();
          }
          i += 3;
          continue;
        }
        if (seq === 'B') {
          // Arrow down — history next
          if (historyIndex < commandHistory.length - 1) {
            historyIndex++;
            inputBuffer = commandHistory[historyIndex];
          } else {
            historyIndex = commandHistory.length;
            inputBuffer = '';
          }
          cursorPos = inputBuffer.length;
          clearLine();
          i += 3;
          continue;
        }
        if (seq === 'C') {
          // Arrow right
          if (cursorPos < inputBuffer.length) {
            cursorPos++;
            write('\x1b[C');
          }
          i += 3;
          continue;
        }
        if (seq === 'D') {
          // Arrow left
          if (cursorPos > 0) {
            cursorPos--;
            write('\x1b[D');
          }
          i += 3;
          continue;
        }
        // Other escape seq — skip
        i++;
        continue;
      }

      // Enter
      if (ch === '\r') {
        write('\r\n');
        processLine(inputBuffer);
        inputBuffer = '';
        cursorPos = 0;
        i++;
        continue;
      }

      // Ctrl+C
      if (code === 3) {
        write('^C\r\n');
        inputBuffer = '';
        cursorPos = 0;
        prompt();
        i++;
        continue;
      }

      // Ctrl+L (clear)
      if (code === 12) {
        write('\x1b[2J\x1b[H');
        inputBuffer = '';
        cursorPos = 0;
        prompt();
        i++;
        continue;
      }

      // Ctrl+U (clear line)
      if (code === 21) {
        const delCount = cursorPos;
        inputBuffer = inputBuffer.slice(cursorPos);
        cursorPos = 0;
        if (delCount > 0) clearLine();
        i++;
        continue;
      }

      // Backspace
      if (ch === '\x7f' || code === 8) {
        if (cursorPos > 0) {
          inputBuffer =
            inputBuffer.slice(0, cursorPos - 1) + inputBuffer.slice(cursorPos);
          cursorPos--;
          clearLine();
        }
        i++;
        continue;
      }

      // Printable characters
      if (code >= 32) {
        inputBuffer =
          inputBuffer.slice(0, cursorPos) + ch + inputBuffer.slice(cursorPos);
        cursorPos++;
        if (cursorPos === inputBuffer.length) {
          // Fast path: just append
          write(ch);
        } else {
          // Mid-line insert: redraw from cursor
          clearLine();
        }
      }

      i++;
    }
  },

  resizeTerminal: async (_cols: number, _rows: number) => {
    // Will become: await invoke("resize_terminal", { cols, rows });
  },

  init: () => {
    writeln(`${BOLD}${CYAN}Welcome to Warp UI${RESET}  ${GRAY}(mock PTY — Rust backend not connected)${RESET}`);
    writeln(`Type ${col('help', YELLOW)} to see available commands.`);
    writeln('');
    prompt();
  },
};

import type { ITheme } from 'xterm';

export interface ColorScheme {
  name: string;
  /** Background hex used for the swatch preview */
  bg: string;
  /** Foreground/accent hex used for the swatch dot preview */
  accent: string;
  theme: ITheme;
}

export const COLOR_SCHEMES: ColorScheme[] = [
  {
    name: 'Default',
    bg: '#0d0e10',
    accent: '#00d5ff',
    theme: {
      background: '#0d0e10',
      foreground: '#e4e4e7',
      cursor: '#00d5ff',
      cursorAccent: '#0d0e10',
      selectionBackground: 'rgba(0, 213, 255, 0.25)',
      black: '#1a1b1e', red: '#e74c3c', green: '#2ecc71', yellow: '#f1c40f',
      blue: '#00d5ff', magenta: '#9b59b6', cyan: '#00bcd4', white: '#e4e4e7',
      brightBlack: '#555e6e', brightRed: '#ff6b6b', brightGreen: '#5efc82',
      brightYellow: '#ffe066', brightBlue: '#6ec6ff', brightMagenta: '#ce93d8',
      brightCyan: '#80deea', brightWhite: '#ffffff',
    },
  },
  {
    name: 'Dracula',
    bg: '#282a36',
    accent: '#ff79c6',
    theme: {
      background: '#282a36',
      foreground: '#f8f8f2',
      cursor: '#f8f8f2',
      cursorAccent: '#282a36',
      selectionBackground: 'rgba(255, 121, 198, 0.25)',
      black: '#21222c', red: '#ff5555', green: '#50fa7b', yellow: '#f1fa8c',
      blue: '#bd93f9', magenta: '#ff79c6', cyan: '#8be9fd', white: '#f8f8f2',
      brightBlack: '#6272a4', brightRed: '#ff6e6e', brightGreen: '#69ff94',
      brightYellow: '#ffffa5', brightBlue: '#d6acff', brightMagenta: '#ff92df',
      brightCyan: '#a4ffff', brightWhite: '#ffffff',
    },
  },
  {
    name: 'One Dark',
    bg: '#282c34',
    accent: '#61afef',
    theme: {
      background: '#282c34',
      foreground: '#abb2bf',
      cursor: '#528bff',
      cursorAccent: '#282c34',
      selectionBackground: 'rgba(97, 175, 239, 0.25)',
      black: '#3f4451', red: '#e06c75', green: '#98c379', yellow: '#e5c07b',
      blue: '#61afef', magenta: '#c678dd', cyan: '#56b6c2', white: '#abb2bf',
      brightBlack: '#4f5666', brightRed: '#be5046', brightGreen: '#98c379',
      brightYellow: '#d19a66', brightBlue: '#61afef', brightMagenta: '#c678dd',
      brightCyan: '#56b6c2', brightWhite: '#ffffff',
    },
  },
  {
    name: 'Nord',
    bg: '#2e3440',
    accent: '#88c0d0',
    theme: {
      background: '#2e3440',
      foreground: '#d8dee9',
      cursor: '#88c0d0',
      cursorAccent: '#2e3440',
      selectionBackground: 'rgba(136, 192, 208, 0.25)',
      black: '#3b4252', red: '#bf616a', green: '#a3be8c', yellow: '#ebcb8b',
      blue: '#81a1c1', magenta: '#b48ead', cyan: '#88c0d0', white: '#e5e9f0',
      brightBlack: '#4c566a', brightRed: '#bf616a', brightGreen: '#a3be8c',
      brightYellow: '#ebcb8b', brightBlue: '#81a1c1', brightMagenta: '#b48ead',
      brightCyan: '#8fbcbb', brightWhite: '#eceff4',
    },
  },
  {
    name: 'Gruvbox',
    bg: '#282828',
    accent: '#fe8019',
    theme: {
      background: '#282828',
      foreground: '#ebdbb2',
      cursor: '#fe8019',
      cursorAccent: '#282828',
      selectionBackground: 'rgba(254, 128, 25, 0.25)',
      black: '#282828', red: '#cc241d', green: '#98971a', yellow: '#d79921',
      blue: '#458588', magenta: '#b16286', cyan: '#689d6a', white: '#a89984',
      brightBlack: '#928374', brightRed: '#fb4934', brightGreen: '#b8bb26',
      brightYellow: '#fabd2f', brightBlue: '#83a598', brightMagenta: '#d3869b',
      brightCyan: '#8ec07c', brightWhite: '#ebdbb2',
    },
  },
  {
    name: 'Tokyo Night',
    bg: '#1a1b2e',
    accent: '#7dcfff',
    theme: {
      background: '#1a1b2e',
      foreground: '#c0caf5',
      cursor: '#7dcfff',
      cursorAccent: '#1a1b2e',
      selectionBackground: 'rgba(125, 207, 255, 0.25)',
      black: '#15161e', red: '#f7768e', green: '#9ece6a', yellow: '#e0af68',
      blue: '#7aa2f7', magenta: '#bb9af7', cyan: '#7dcfff', white: '#a9b1d6',
      brightBlack: '#414868', brightRed: '#f7768e', brightGreen: '#9ece6a',
      brightYellow: '#e0af68', brightBlue: '#7aa2f7', brightMagenta: '#bb9af7',
      brightCyan: '#7dcfff', brightWhite: '#c0caf5',
    },
  },
  {
    name: 'Solarized',
    bg: '#002b36',
    accent: '#268bd2',
    theme: {
      background: '#002b36',
      foreground: '#839496',
      cursor: '#268bd2',
      cursorAccent: '#002b36',
      selectionBackground: 'rgba(38, 139, 210, 0.25)',
      black: '#073642', red: '#dc322f', green: '#859900', yellow: '#b58900',
      blue: '#268bd2', magenta: '#d33682', cyan: '#2aa198', white: '#eee8d5',
      brightBlack: '#002b36', brightRed: '#cb4b16', brightGreen: '#586e75',
      brightYellow: '#657b83', brightBlue: '#839496', brightMagenta: '#6c71c4',
      brightCyan: '#93a1a1', brightWhite: '#fdf6e3',
    },
  },
];

export function getSchemeByName(name: string): ColorScheme {
  return COLOR_SCHEMES.find((s) => s.name === name) ?? COLOR_SCHEMES[0];
}

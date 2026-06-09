// Vite config for Tauri desktop builds.
// Used by:  pnpm run tauri:vite-dev   (dev mode)
//           pnpm run tauri:vite-build  (production bundle)
//
// Key differences from vite.config.ts:
// - No PORT / BASE_PATH env var requirements (Tauri manages the webview)
// - base: "./" so asset paths are relative inside the webview
// - Dev server on localhost:1420 (Tauri's default devUrl)
// - Build target matched to platform WebView engine
// - No Replit-specific plugins

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// @ts-ignore — suppresses CJS interop warnings from Vite in some environments
process.env.VITE_CJS_IGNORE_WARNING = "true";

export default defineConfig({
  // Relative base is required for Tauri's webview to load assets correctly
  base: "./",

  plugins: [react(), tailwindcss()],

  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      // attached_assets are only available in the Replit dev environment;
      // ship real assets in public/ for production Tauri builds.
      "@assets": path.resolve(import.meta.dirname, "public", "assets"),
    },
    dedupe: ["react", "react-dom"],
  },

  root: path.resolve(import.meta.dirname),

  build: {
    // Match the WebView engine per platform:
    //   Windows → Chromium (Edge WebView2)
    //   macOS/Linux → WebKit
    target:
      process.env.TAURI_ENV_PLATFORM === "windows" ? "chrome105" : "safari13",
    minify: process.env.TAURI_ENV_DEBUG ? false : "esbuild",
    sourcemap: !!process.env.TAURI_ENV_DEBUG,
    outDir: "dist",
    emptyOutDir: true,
  },

  server: {
    // Tauri reads devUrl from tauri.conf.json; keep this in sync.
    port: 1420,
    strictPort: true,
    // Bind to localhost only — desktop apps shouldn't expose the dev server
    // to the network.
    host: false,
    watch: {
      // On Windows, Vite's file watcher may need polling inside WSL/VMs
      usePolling: process.platform === "win32",
    },
  },

  // Prevent Vite from clearing the terminal; keep Tauri's output visible
  clearScreen: false,
});

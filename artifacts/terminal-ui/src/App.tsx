import { useEffect } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { TopBar } from "@/components/layout/TopBar";
import { StatusBar } from "@/components/layout/StatusBar";
import { Sidebar } from "@/components/sidebar/Sidebar";
import { AiPanel } from "@/components/ai/AiPanel";
import { CommandPalette } from "@/components/command-palette/CommandPalette";
import { TerminalWorkspace } from "@/pages/TerminalWorkspace";
import { HistoryPage } from "@/pages/HistoryPage";
import { WorkflowsPage } from "@/pages/WorkflowsPage";
import { SettingsPage } from "@/pages/SettingsPage";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useSettingsStore } from "@/stores/settingsStore";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={TerminalWorkspace} />
      <Route path="/history" component={HistoryPage} />
      <Route path="/workflows" component={WorkflowsPage} />
      <Route path="/settings" component={SettingsPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function ThemeManager() {
  const theme = useSettingsStore((s) => s.theme);

  useEffect(() => {
    const el = document.documentElement;
    const applyDark = () => {
      el.classList.add("dark");
      el.classList.remove("light");
    };
    const applyLight = () => {
      el.classList.add("light");
      el.classList.remove("dark");
    };

    if (theme === "dark") {
      applyDark();
    } else if (theme === "light") {
      applyLight();
    } else {
      // system
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      mq.matches ? applyDark() : applyLight();
      const handler = (e: MediaQueryListEvent) =>
        e.matches ? applyDark() : applyLight();
      mq.addEventListener("change", handler);
      return () => mq.removeEventListener("change", handler);
    }
  }, [theme]);

  return null;
}

function App() {
  useKeyboardShortcuts();

  return (
    <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
      <ThemeManager />
      <div className="flex flex-col h-screen w-screen overflow-hidden bg-background text-foreground selection:bg-primary/30">
        <TopBar />

        <div className="flex-1 flex overflow-hidden relative">
          <PanelGroup direction="horizontal">
            <Panel defaultSize={20} minSize={5} maxSize={30} collapsible={true}>
              <Sidebar />
            </Panel>

            <PanelResizeHandle className="w-1 bg-border hover:bg-primary/50 active:bg-primary transition-colors cursor-col-resize z-20" />

            <Panel>
              <div className="h-full w-full relative">
                <Router />
                <AiPanel />
              </div>
            </Panel>
          </PanelGroup>
        </div>

        <StatusBar />
        <CommandPalette />
      </div>
    </WouterRouter>
  );
}

export default App;

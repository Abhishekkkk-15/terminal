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

function App() {
  useKeyboardShortcuts();

  return (
    <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
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

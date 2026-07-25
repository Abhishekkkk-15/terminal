export interface EventPayloads {
  'terminal-output': { data: string };
  'command-started': { id: string; command: string; workingDir: string; gitBranch: string | null };
  'command-finished': { id: string; exitCode: number; duration: number; output: string[] };
  'workspace-updated': { projectId: string };
  'agent-message': { messageId: string; content: string };
  'backend-status': { status: 'connected' | 'connecting' | 'disconnected' };
}

type EventCallback<T> = (payload: T) => void;

// In-memory event bus for mock mode.
// When the Rust backend is ready, replace this with Tauri's listen() / emit() IPC.
const listeners = new Map<string, Set<EventCallback<unknown>>>();

export const eventBus = {
  emit<K extends keyof EventPayloads>(event: K, payload: EventPayloads[K]): void {
    const handlers = listeners.get(event);
    if (handlers) {
      handlers.forEach((cb) => cb(payload as unknown));
    }
  },
};

export interface EventsService {
  listen: <K extends keyof EventPayloads>(
    event: K,
    callback: EventCallback<EventPayloads[K]>
  ) => () => void;
}

// The UI must only use eventsService.listen() — never eventBus directly.
// eventBus.emit() is reserved for service implementations (mock PTY, etc.).
export const eventsService: EventsService = {
  listen: (event, callback) => {
    if (!listeners.has(event)) {
      listeners.set(event, new Set());
    }
    listeners.get(event)!.add(callback as EventCallback<unknown>);
    return () => {
      listeners.get(event)?.delete(callback as EventCallback<unknown>);
    };
  },
};

export interface EventPayloads {
  'terminal-output': { data: string };
  'command-started': { id: string, command: string };
  'command-finished': { id: string, exitCode: number };
  'workspace-updated': { projectId: string };
  'agent-message': { messageId: string, content: string };
  'backend-status': { status: 'connected' | 'connecting' | 'disconnected' };
}

type EventCallback<T> = (payload: T) => void;

export interface EventsService {
  listen: <K extends keyof EventPayloads>(event: K, callback: EventCallback<EventPayloads[K]>) => () => void;
}

export const eventsService: EventsService = {
  listen: (event, callback) => {
    console.log(`[Tauri Mock] listen: ${event}`);
    // Return a mock unlisten function
    return () => console.log(`[Tauri Mock] unlisten: ${event}`);
  }
};

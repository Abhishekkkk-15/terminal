export interface AiService {
  sendAgentMessage: (message: string, context?: any) => Promise<string>;
}

export const aiService: AiService = {
  sendAgentMessage: async (message, context) => {
    console.log('[Tauri Mock] send_agent_message:', message, context);
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve("This is a mock response from the AI assistant. I understand you are asking about: " + message);
      }, 1000);
    });
  }
};

import { create } from 'zustand';

export interface AiMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  relatedCommandId?: string;
}

interface AiStore {
  messages: AiMessage[];
  isOpen: boolean;
  isLoading: boolean;
  activeModel: string;
  setIsOpen: (isOpen: boolean) => void;
  addMessage: (message: AiMessage) => void;
  setLoading: (isLoading: boolean) => void;
}

export const useAiStore = create<AiStore>((set) => ({
  messages: [
    {
      id: '1',
      role: 'user',
      content: 'Why did my git status fail?',
      timestamp: new Date(Date.now() - 100000),
      relatedCommandId: '3'
    },
    {
      id: '2',
      role: 'assistant',
      content: 'Your `git status` returned an exit code of 1, which typically indicates there are uncommitted changes or untracked files in your working directory. As shown in the output, you have modified `src/App.tsx` and `src/index.css`.\n\nTo resolve this, you can run:\n```bash\ngit add .\ngit commit -m "Update frontend"\n```',
      timestamp: new Date(Date.now() - 95000),
      relatedCommandId: '3'
    }
  ],
  isOpen: false,
  isLoading: false,
  activeModel: 'Claude 3.5 Sonnet',
  setIsOpen: (isOpen) => set({ isOpen }),
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
  setLoading: (isLoading) => set({ isLoading })
}));

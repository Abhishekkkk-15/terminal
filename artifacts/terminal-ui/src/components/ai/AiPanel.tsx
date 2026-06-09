import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Bot, User, TerminalSquare, Command } from 'lucide-react';
import { useAiStore } from '@/stores/aiStore';

export function AiPanel() {
  const { isOpen, setIsOpen, messages, activeModel, addMessage, isLoading, setLoading } = useAiStore();
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    
    addMessage({
      id: Math.random().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    });
    
    setInput('');
    setLoading(true);
    
    // Mock response
    setTimeout(() => {
      addMessage({
        id: Math.random().toString(),
        role: 'assistant',
        content: `I understand you're asking about the terminal. Here's a suggested command to help you:\n\n\`\`\`bash\nls -la\n\`\`\`\n\nThis will show all files including hidden ones.`,
        timestamp: new Date()
      });
      setLoading(false);
    }, 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed top-10 bottom-7 right-0 w-[320px] bg-card border-l border-border flex flex-col z-40 shadow-2xl"
        >
          {/* Header */}
          <div className="h-12 border-b border-border flex items-center justify-between px-4 shrink-0">
            <div className="flex items-center gap-2">
              <Bot size={18} className="text-primary" />
              <span className="font-semibold text-sm">AI Assistant</span>
              <span className="text-[10px] bg-secondary text-muted-foreground px-1.5 py-0.5 rounded ml-2">
                {activeModel}
              </span>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-secondary">
              <X size={16} />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground space-y-4 p-4">
                <Bot size={48} className="opacity-20" />
                <p className="text-sm">How can I help you with your workflow today?</p>
                <div className="grid gap-2 w-full mt-4">
                  <button onClick={() => setInput('Explain last command output')} className="text-xs bg-secondary/50 hover:bg-secondary border border-border p-2 rounded text-left transition-colors">
                    Explain last command output
                  </button>
                  <button onClick={() => setInput('How do I undo my last git commit?')} className="text-xs bg-secondary/50 hover:bg-secondary border border-border p-2 rounded text-left transition-colors">
                    How do I undo my last git commit?
                  </button>
                </div>
              </div>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className={`flex flex-col gap-1 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`flex items-center gap-2 text-xs ${msg.role === 'user' ? 'text-primary' : 'text-muted-foreground'}`}>
                    {msg.role === 'user' ? <User size={12} /> : <Bot size={12} />}
                    {msg.role === 'user' ? 'You' : 'Assistant'}
                  </div>
                  <div className={`text-sm p-3 rounded-lg max-w-[90%] whitespace-pre-wrap ${
                    msg.role === 'user' 
                      ? 'bg-primary text-primary-foreground rounded-tr-sm' 
                      : 'bg-secondary text-foreground rounded-tl-sm border border-border'
                  }`}>
                    {msg.content.split('```').map((part, i) => {
                      if (i % 2 !== 0) {
                        return (
                          <div key={i} className="my-2 bg-background border border-border rounded p-2 font-mono text-xs overflow-x-auto">
                            {part.replace(/^bash\n/, '')}
                          </div>
                        );
                      }
                      return <span key={i}>{part}</span>;
                    })}
                  </div>
                </div>
              ))
            )}
            
            {isLoading && (
              <div className="flex items-center gap-2 text-muted-foreground text-xs p-2">
                <span className="animate-pulse">●</span>
                <span className="animate-pulse delay-75">●</span>
                <span className="animate-pulse delay-150">●</span>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-3 border-t border-border bg-card shrink-0">
            <div className="relative border border-border focus-within:border-primary rounded-lg overflow-hidden bg-background transition-colors">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask AI anything..."
                className="w-full bg-transparent text-sm p-3 pr-10 resize-none outline-none min-h-[80px] max-h-[200px]"
              />
              <div className="absolute bottom-2 right-2 flex items-center gap-2 text-xs text-muted-foreground">
                <span className="hidden sm:inline-block border border-border rounded px-1.5 py-0.5 opacity-50">⌘↵</span>
                <button 
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="bg-primary text-primary-foreground p-1.5 rounded disabled:opacity-50 hover:opacity-90 transition-opacity"
                >
                  <Send size={14} />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

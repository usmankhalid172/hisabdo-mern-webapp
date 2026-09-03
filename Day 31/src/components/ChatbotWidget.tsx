'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User, Loader2 } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hello! How can I help you analyze your expenses or saving tips today?' },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userQuery = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userQuery }]);
    setIsLoading(true);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_AI_API_URL || 'http://localhost:8000';
      const today = new Date().toISOString().split('T')[0];

      const res = await fetch(`${baseUrl}/v1/assistant/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: userQuery,
          reference_date: today,
        }),
      });

      const data = await res.json();

      if (res.ok && data.status === 'ok') {
        setMessages((prev) => [...prev, { role: 'assistant', content: data.response }]);
      } else {
        const errorDetail = data.detail || 'Unable to process your request.';
        setMessages((prev) => [...prev, { role: 'assistant', content: `Error: ${errorDetail}` }]);
      }
    } catch (err) {
      console.error('AI Chatbot error:', err);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Could not connect to the AI service. Please verify the AI backend server is running.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white p-4 rounded-full shadow-lg transition-transform hover:scale-105"
          aria-label="Open AI Assistant"
        >
          <MessageSquare className="w-6 h-6" />
        </button>
      )}

      {/* Chat Box Drawer */}
      {isOpen && (
        <div className="w-80 sm:w-96 h-[500px] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-slate-800 p-4 border-b border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-2 text-white font-semibold">
              <Bot className="w-5 h-5 text-emerald-400" />
              <span>HisabDo AI Assistant</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-full bg-emerald-600/20 text-emerald-400 flex items-center justify-center shrink-0 mt-1">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`p-3 rounded-xl max-w-[80%] text-sm whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-emerald-600 text-white rounded-br-none'
                      : 'bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700'
                  }`}
                >
                  {msg.content}
                </div>
                {msg.role === 'user' && (
                  <div className="w-7 h-7 rounded-full bg-slate-700 text-slate-300 flex items-center justify-center shrink-0 mt-1">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-2 items-center text-slate-400 text-sm">
                <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                <span>AI is thinking...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form onSubmit={handleSend} className="p-3 border-t border-slate-800 bg-slate-900/50 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about spending or saving..."
              className="flex-1 bg-slate-800 text-white text-sm rounded-xl px-3 py-2 border border-slate-700 focus:outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white p-2 rounded-xl transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
"use client";

import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Bot, User, Sparkles, Minimize2 } from "lucide-react";
import { chatbotService, ChatMessage } from "@/services/chatbotService";
import { useAuth } from "@/context/AuthContext";

export function AiChatbotWidget() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "m-welcome",
      sender: "bot",
      text: "Assalam-o-Alaikum! I am your HisabDo AI Assistant. You can ask me anything about your invoices, customer khatas, daily limits, or expense management.",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: "u-" + Date.now(),
      sender: "user",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const reply = await chatbotService.sendMessage(
        text,
        messages,
        user?.id || "guest"
      );

      const botMsg: ChatMessage = {
        id: "b-" + Date.now(),
        sender: "bot",
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: "err-" + Date.now(),
          sender: "bot",
          text: "I'm temporarily unable to reach the server. Please try asking again.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    "How many free invoices do I have?",
    "How to send WhatsApp khata reminder?",
    "Dukan ka hisab kaise manage karein?",
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Expanded Chat Box */}
      {isOpen && (
        <div className="w-[360px] sm:w-[400px] h-[520px] rounded-2xl bg-[#14141E] border border-indigo-500/30 shadow-2xl flex flex-col overflow-hidden mb-4 animate-scaleUp text-slate-100">
          {/* Header */}
          <div className="px-4 py-3 bg-gradient-to-r from-[#1A237E] to-[#4A148C] flex items-center justify-between border-b border-indigo-400/20">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-emerald-400">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                  HisabDo AI Assistant
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </h4>
                <p className="text-[10px] text-indigo-200">Merchant Khata & Invoicing Helper</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                title="Minimize"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#0E0E17]/90 text-sm">
            {messages.map((m) => {
              const isUser = m.sender === "user";
              return (
                <div
                  key={m.id}
                  className={`flex gap-2.5 ${isUser ? "justify-end" : "justify-start"}`}
                >
                  {!isUser && (
                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shrink-0 mt-0.5">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                  )}

                  <div
                    className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 leading-relaxed text-xs ${
                      isUser
                        ? "bg-[#1A237E] text-white rounded-br-xs shadow-md"
                        : "bg-[#1C1C28] text-slate-200 border border-slate-800 rounded-bl-xs shadow-sm"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{m.text}</p>
                    <span
                      className={`text-[9px] block text-right mt-1 opacity-50 ${
                        isUser ? "text-indigo-200" : "text-slate-400"
                      }`}
                    >
                      {m.timestamp}
                    </span>
                  </div>

                  {isUser && (
                    <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 shrink-0 mt-0.5">
                      <User className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              );
            })}

            {isLoading && (
              <div className="flex gap-2.5 items-center text-slate-400 text-xs py-1">
                <div className="w-7 h-7 rounded-full bg-indigo-900/50 flex items-center justify-center text-indigo-300 shrink-0">
                  <Bot className="w-3.5 h-3.5 animate-bounce" />
                </div>
                <div className="bg-[#1C1C28] border border-slate-800 rounded-xl px-3 py-2 text-xs flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse delay-150" />
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse delay-300" />
                  <span className="ml-1 text-[11px] text-slate-400">Thinking...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          {messages.length < 3 && (
            <div className="px-3 py-2 bg-[#12121C] border-t border-slate-800/80 flex flex-wrap gap-1.5">
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleSend(prompt)}
                  className="text-[10px] bg-slate-800/70 hover:bg-slate-700/80 text-indigo-300 border border-indigo-500/20 px-2 py-1 rounded-lg transition-colors truncate max-w-full"
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-2.5 bg-[#14141E] border-t border-slate-800 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything in English or Urdu..."
              className="flex-1 bg-[#1E1E2C] border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="p-2 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:from-indigo-500 hover:to-purple-500 shadow-md shadow-indigo-600/30 transition-all shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-2.5 py-3 px-4 rounded-2xl bg-gradient-to-r from-[#1A237E] to-[#6A1B9A] hover:from-[#283593] hover:to-[#7B1FA2] text-white shadow-xl shadow-indigo-900/40 border border-white/20 transition-all duration-300 hover:scale-105"
        >
          <div className="relative">
            <Bot className="w-5 h-5 text-emerald-400" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          </div>
          <span className="font-bold text-xs tracking-tight">AI Assistant</span>
          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.5 rounded-md font-semibold">
            Online
          </span>
        </button>
      )}
    </div>
  );
}

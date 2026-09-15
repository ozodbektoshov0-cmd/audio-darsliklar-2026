/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  MessageSquare,
  X,
  Send,
  Bot,
  User,
  Sparkles,
  Maximize2,
  Trash2,
  ExternalLink,
  Volume2
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { useLanguage } from "../context/LanguageContext";
import { useStudent } from "../context/StudentContext";

interface WidgetMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
}

export default function AiChatWidget() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const { language } = useLanguage();
  const { profile } = useStudent();

  const [messages, setMessages] = useState<WidgetMessage[]>([
    {
      id: "w-1",
      role: "assistant",
      text:
        language === "uz"
          ? "Assalomu alaykum! Maktab darsliklari yoki biror mavzu bo'yicha savolingiz bormi? Yordam berishga tayyorman!"
          : "Здравствуйте! Есть вопрос по школьному учебнику или теме? С радостью помогу вам!",
    },
  ]);

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  if (location.pathname === "/ai-tutor") {
    return null;
  }

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    setInput("");

    setMessages((prev) => [
      ...prev,
      { id: `w-user-${Date.now()}`, role: "user", text: userText },
    ]);
    setIsLoading(true);

    try {
      const history = messages
        .filter((m) => m.id !== "w-1")
        .map((m) => ({ role: m.role, text: m.text }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history,
          message: userText,
          modelType: "flash",
          systemInstruction:
            "Siz O'zbekiston maktab o'quvchilari uchun ixcham, samimiy va tushunarli AI yordamchisiz. Javoblarni qisqa, aniq va foydali bering.",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Xatolik");

      setMessages((prev) => [
        ...prev,
        {
          id: `w-bot-${Date.now()}`,
          role: "assistant",
          text: data.text || "Javob olindi.",
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `w-err-${Date.now()}`,
          role: "assistant",
          text:
            language === "uz"
              ? "Kechirasiz, xatolik yuz berdi. Iltimos, qayta urinib ko'ring."
              : "Произошла ошибка, попробуйте снова.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <motion.button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label="AI Chatbot"
          className="relative flex items-center justify-center w-14 h-14 rounded-full bg-brand-primary text-white shadow-xl shadow-blue-500/35 hover:bg-blue-700 transition-all border-2 border-white dark:border-slate-800"
        >
          {isOpen ? <X size={24} /> : <Bot size={26} />}
          {!isOpen && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500 text-[9px] font-black text-white items-center justify-center">
                AI
              </span>
            </span>
          )}
        </motion.button>
      </div>

      {/* Floating Chat Modal Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-4 sm:right-6 z-50 w-[92vw] sm:w-[400px] h-[520px] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white">
                  <Bot size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-sm leading-tight flex items-center gap-1.5">
                    <span>AI Ustoz</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {profile.grade
                      ? `${profile.grade}${language === "uz" ? "-sinf bo'yicha" : " класс"}`
                      : (language === "uz" ? "Darsliklar bo'yicha maslahat" : "Помощь по учебе")}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 text-slate-400">
                <Link
                  to="/ai-tutor"
                  onClick={() => setIsOpen(false)}
                  title="To'liq ekranda ochish"
                  className="p-1.5 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                >
                  <Maximize2 size={15} />
                </Link>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X size={17} />
                </button>
              </div>
            </div>

            {/* Messages body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50 dark:bg-slate-900/50">
              {messages.map((msg) => {
                const isUser = msg.role === "user";
                return (
                  <div
                    key={msg.id}
                    className={`flex gap-2 ${isUser ? "justify-end" : "justify-start"}`}
                  >
                    {!isUser && (
                      <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 text-[10px]">
                        <Bot size={13} />
                      </div>
                    )}
                    <div
                      className={`max-w-[82%] p-3 rounded-2xl text-xs leading-relaxed ${
                        isUser
                          ? "bg-brand-primary text-white rounded-tr-xs"
                          : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-xs border border-slate-200 dark:border-slate-700 shadow-xs"
                      }`}
                    >
                      <ReactMarkdown>{msg.text}</ReactMarkdown>
                    </div>
                  </div>
                );
              })}

              {isLoading && (
                <div className="flex gap-2 justify-start items-center text-slate-400 text-xs py-1">
                  <div className="w-5 h-5 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
                    <Bot size={11} />
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce [animation-delay:0.4s]"></span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick action footer */}
            <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={language === "uz" ? "Savol yozing..." : "Задайте вопрос..."}
                  className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-brand-primary"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="p-2 bg-brand-primary hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl transition-all shrink-0"
                >
                  <Send size={14} />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

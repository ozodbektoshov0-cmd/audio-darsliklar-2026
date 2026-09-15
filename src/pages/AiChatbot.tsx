/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Send,
  Bot,
  User,
  Sparkles,
  Globe,
  Trash2,
  Copy,
  Check,
  RotateCcw,
  BookOpen,
  HelpCircle,
  Volume2,
  ExternalLink,
  GraduationCap,
  Lightbulb,
  Zap,
  CheckCircle2
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useLanguage } from "../context/LanguageContext";
import { useStudent } from "../context/StudentContext";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp: string;
  groundingChunks?: Array<{
    web?: {
      uri: string;
      title: string;
    };
  }>;
}

interface PromptPreset {
  categoryUz: string;
  categoryRu: string;
  icon: string;
  promptsUz: string[];
  promptsRu: string[];
}

const PRESETS: PromptPreset[] = [
  {
    categoryUz: "Adabiyot & Til",
    categoryRu: "Литература и Язык",
    icon: "📖",
    promptsUz: [
      "9-sinf adabiyot: Alisher Navoiy g'azallari tahlilini qilib ber.",
      "O'tkan kunlar romanidagi Otabek va Kumush obrazlariga tavsif ber.",
      "Ona tilidan ergashgan qo'shma gaplar turlarini misollar bilan tushuntir.",
    ],
    promptsRu: [
      "Анализ узбекской классической литературы 9 класса.",
      "Характеристика персонажей романа «Минувшие дни».",
      "Сложноподчиненные предложения в узбекском и русском языках.",
    ],
  },
  {
    categoryUz: "Aniq Fanlar",
    categoryRu: "Точные Науки",
    icon: "📐",
    promptsUz: [
      "Matematikadan kvadrat tenglamalarni diskriminant orqali yechishni bosqichma-bosqich ko'rsat.",
      "Fizikadan Nyutonning 3 ta harakat qonunini hayotiy misollar bilan tushuntir.",
      "Kimyodan Mendeleyev davriy qonunining mohiyatini sodda qilib aytib ber.",
    ],
    promptsRu: [
      "Пошаговое решение квадратных уравнений через дискриминант.",
      "Три закона Ньютона с понятными жизненными примерами.",
      "Суть периодического закона Менделеева простыми словами.",
    ],
  },
  {
    categoryUz: "Tarix & Jamiyat",
    categoryRu: "История и Общество",
    icon: "🏛️",
    promptsUz: [
      "8-sinf O'zbekiston tarixi: Amir Temur davlatining tuzilishi va harbiy yurishlari.",
      "Buyuk ipak yo'lining O'zbekiston shaharlari rivojidagi o'rni.",
      "10-sinf Jahon tarixi: Birinchi jahon urushining asosiy sabablari.",
    ],
    promptsRu: [
      "История Узбекистана: эпоха Амира Темура и его походы.",
      "Роль Великого шелкового пути в развитии городов Центральной Азии.",
      "Основные причины и итоги Первой мировой войны.",
    ],
  },
];

export default function AiChatbot() {
  const { language } = useLanguage();
  const { profile } = useStudent();

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    return [
      {
        id: "welcome-1",
        role: "assistant",
        text:
          language === "uz"
            ? `Assalomu alaykum! Men **Audio Darsliklar** platformasining aqlli AI Ustoziman.${
                profile.grade ? ` Siz **${profile.grade}-sinf** o'quvchisi ekanligingizni bilaman.` : ""
              } Sizga 1-11-sinf maktab darsliklari, mavzular tushuntirishi, test savollari, adabiy tahlillar va uyga vazifalar bo'yicha yordam berishga tayyorman. Menga istalgan savolingizni bering!`
            : `Здравствуйте! Я умный ИИ Учитель платформы **Audio Darsliklar**.${
                profile.grade ? ` Я вижу, что вы учитесь в **${profile.grade} классе**.` : ""
              } Готов помочь вам с учебниками 1-11 классов, разъяснением тем, домашними заданиями и решением задач. Задайте мне любой вопрос!`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ];
  });

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [useSearch, setUseSearch] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (customText?: string) => {
    const textToSend = customText || input;
    if (!textToSend.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const chatHistory = messages
        .filter((m) => m.id !== "welcome-1")
        .map((m) => ({
          role: m.role,
          text: m.text,
        }));

      const systemInstruction =
        `Siz O'zbekiston maktab darsliklari (1-11 sinf) bo'yicha professional virtual repetitorsiz.` +
        (profile.grade ? ` Foydalanuvchi ${profile.grade}-sinf o'quvchisi. Tushuntirishlaringizni shu yosh va sinf me'yorlariga moslang.` : "") +
        ` Javoblaringizni do'stona, aniq, chiroyli Markdown formatida bering. O'quvchini doim bilim olishga rag'batlantiring.`;

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: chatHistory,
          message: textToSend.trim(),
          useSearch,
          systemInstruction,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "AI javob berishda xatolik yuz berdi");
      }

      const botMessage: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: "assistant",
        text: data.text || "Javob hosil qilib bo'lmadi.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        groundingChunks: data.groundingChunks || [],
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err: any) {
      const errorBotMessage: ChatMessage = {
        id: `err-${Date.now()}`,
        role: "assistant",
        text:
          language === "uz"
            ? `⚠️ Kechirasiz, xatolik yuz berdi: ${err.message || "Internet aloqasi yoki xizmatda uzilish"}. Iltimos, qaytadan urinib ko'ring.`
            : `⚠️ Извините, произошла ошибка: ${err.message || "Сбой связи с сервисом"}. Пожалуйста, попробуйте снова.`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorBotMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // TTS Read-aloud integration for Chatbot answers!
  const handleSpeak = async (id: string, textToRead: string) => {
    if (speakingId === id) {
      // stop
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }

    setSpeakingId(id);

    try {
      // First try Gemini high-quality TTS via API
      const cleanText = textToRead.replace(/[*#_`>]/g, "").slice(0, 300);
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: cleanText, voice: "Kore" }),
      });
      const data = await res.json();

      if (data.audioBase64) {
        const audio = new Audio(`data:audio/wav;base64,${data.audioBase64}`);
        audio.onended = () => setSpeakingId(null);
        audio.onerror = () => setSpeakingId(null);
        audio.play();
        return;
      }
    } catch {
      // fallback to browser TTS
    }

    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(textToRead.slice(0, 400));
      utterance.lang = language === "uz" ? "uz-UZ" : "ru-RU";
      utterance.onend = () => setSpeakingId(null);
      utterance.onerror = () => setSpeakingId(null);
      window.speechSynthesis.speak(utterance);
    } else {
      setSpeakingId(null);
    }
  };

  const handleClear = () => {
    setMessages([
      {
        id: "welcome-reset",
        role: "assistant",
        text:
          language === "uz"
            ? "Muloqot tozalandi. Yangi savollaringiz bo'lsa, marhamat!"
            : "Чат очищен. Готов к новым вопросам!",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto flex flex-col">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-brand-primary dark:text-blue-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles size={14} />
            <span>{language === "uz" ? "Aqlli Virtual Ustoz" : "Умный виртуальный учитель"}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {language === "uz" ? "AI Darslik & Repetitor Chatboti" : "ИИ Школьный Репетитор"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {language === "uz"
              ? "Barcha maktab fanlari bo'yicha tezkor savol-javob, masalalar yechimi va dars mavzularining batafsil izohi."
              : "Ответы на вопросы по школьной программе, решения задач и разъяснение тем учебников."}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Google Search Grounding Toggle */}
          <button
            type="button"
            onClick={() => setUseSearch(!useSearch)}
            className={`px-3 py-2 rounded-2xl border text-xs font-bold flex items-center gap-2 transition-all ${
              useSearch
                ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/25"
                : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300"
            }`}
            title="Google Search orqali eng yangi ma'lumotlarni qidirish"
          >
            <Globe size={15} className={useSearch ? "animate-spin" : ""} />
            <span>{language === "uz" ? "Google Qidiruv" : "Google Поиск"}</span>
            <span
              className={`w-2 h-2 rounded-full ${
                useSearch ? "bg-green-400" : "bg-slate-300 dark:bg-slate-600"
              }`}
            ></span>
          </button>

          {/* Clear chat */}
          <button
            type="button"
            onClick={handleClear}
            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-2xl border border-slate-200 dark:border-slate-800 transition-colors"
            title="Suhbatni tozalash"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Main Chat Layout: 2 Columns on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
        {/* Left Side: Preset questions & Tips (4 cols) */}
        <div className="lg:col-span-4 space-y-5 hidden md:block">
          {/* Student info card */}
          <div className="p-4 rounded-3xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/60">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-brand-primary text-white flex items-center justify-center font-bold">
                <GraduationCap size={20} />
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {language === "uz" ? "O'quvchi ma'lumoti" : "Данные ученика"}
                </h3>
                <p className="text-sm font-black text-slate-900 dark:text-white">
                  {profile.grade
                    ? `${profile.grade}${language === "uz" ? "-sinf o'quvchisi" : " класс"}`
                    : (language === "uz" ? "Umumiy darsliklar" : "Все классы")}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Prompts Presets */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Lightbulb size={14} className="text-amber-500" />
              <span>{language === "uz" ? "Tezkor Savol Namunalari" : "Примеры вопросов"}</span>
            </h3>

            {PRESETS.map((cat, idx) => (
              <div key={idx} className="space-y-1.5">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <span>{cat.icon}</span>
                  <span>{language === "uz" ? cat.categoryUz : cat.categoryRu}</span>
                </span>
                <div className="space-y-1">
                  {(language === "uz" ? cat.promptsUz : cat.promptsRu).map((prompt, pIdx) => (
                    <button
                      key={pIdx}
                      type="button"
                      onClick={() => handleSend(prompt)}
                      className="w-full text-left p-2 rounded-xl text-xs text-slate-600 dark:text-slate-400 hover:text-brand-primary dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-all line-clamp-2 border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                    >
                      • {prompt}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Chat Window & Input (8 cols) */}
        <div className="lg:col-span-8 flex flex-col h-[650px] bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          {/* Messages Thread */}
          <div className="flex-1 p-5 overflow-y-auto space-y-4">
            {messages.map((msg) => {
              const isUser = msg.role === "user";
              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}
                >
                  {!isUser && (
                    <div className="w-8 h-8 rounded-xl bg-brand-primary text-white flex items-center justify-center shrink-0 shadow-xs">
                      <Bot size={18} />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed transition-all shadow-xs ${
                      isUser
                        ? "bg-brand-primary text-white rounded-tr-xs"
                        : "bg-slate-100/80 dark:bg-slate-800/80 text-slate-800 dark:text-slate-100 rounded-tl-xs border border-slate-200/50 dark:border-slate-700/50"
                    }`}
                  >
                    {/* Content */}
                    <div className="markdown-content">
                      <ReactMarkdown>{msg.text}</ReactMarkdown>
                    </div>

                    {/* Google Search Grounding Sources */}
                    {msg.groundingChunks && msg.groundingChunks.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-700/60 space-y-1.5 text-xs">
                        <span className="font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <Globe size={12} />
                          <span>{language === "uz" ? "Manbalar & Havolalar:" : "Источники:"}</span>
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {msg.groundingChunks.map((chunk, cIdx) => {
                            if (!chunk.web?.uri) return null;
                            return (
                              <a
                                key={cIdx}
                                href={chunk.web.uri}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-brand-primary dark:text-blue-400 hover:underline text-[11px]"
                              >
                                <span>{chunk.web.title || "Manba"}</span>
                                <ExternalLink size={10} />
                              </a>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Message Action Footer */}
                    <div className={`mt-2 flex items-center gap-3 text-[11px] ${
                      isUser ? "text-blue-200 justify-end" : "text-slate-400 justify-between"
                    }`}>
                      <span>{msg.timestamp}</span>

                      {!isUser && (
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleSpeak(msg.id, msg.text)}
                            title="Ovoz chiqarib o'qish (TTS)"
                            className={`p-1 rounded-lg transition-colors flex items-center gap-1 ${
                              speakingId === msg.id
                                ? "text-amber-500 bg-amber-50 dark:bg-amber-950/50 font-bold"
                                : "hover:text-brand-primary"
                            }`}
                          >
                            <Volume2 size={13} className={speakingId === msg.id ? "animate-pulse" : ""} />
                            <span>{speakingId === msg.id ? (language === "uz" ? "O'qilmoqda..." : "Читает...") : (language === "uz" ? "Tinglash" : "Слушать")}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleCopy(msg.id, msg.text)}
                            title="Nusxa olish"
                            className="p-1 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg transition-colors"
                          >
                            {copiedId === msg.id ? <Check size={13} className="text-green-500" /> : <Copy size={13} />}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {isUser && (
                    <div className="w-8 h-8 rounded-xl bg-slate-800 text-white flex items-center justify-center shrink-0">
                      <User size={18} />
                    </div>
                  )}
                </div>
              );
            })}

            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-xl bg-brand-primary text-white flex items-center justify-center shrink-0 animate-pulse">
                  <Bot size={18} />
                </div>
                <div className="p-4 rounded-2xl rounded-tl-xs bg-slate-100 dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-brand-primary animate-bounce"></div>
                  <div className="w-2 h-2 rounded-full bg-brand-primary animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-2 h-2 rounded-full bg-brand-primary animate-bounce [animation-delay:0.4s]"></div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium ml-1">
                    {language === "uz" ? "AI Ustoz o'ylamoqda..." : "ИИ Учитель думает..."}
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Box */}
          <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-end gap-2"
            >
              <textarea
                ref={textareaRef}
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder={
                  language === "uz"
                    ? "Darslik, vazifa yoki mavzu haqida savol bering (Enter yuboradi)..."
                    : "Спросите о теме, задаче или правиле из учебника..."
                }
                className="flex-1 max-h-32 p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-primary text-sm text-slate-800 dark:text-slate-100 resize-none transition-all"
              />

              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className={`p-3.5 rounded-2xl text-white font-bold flex items-center justify-center transition-all shadow-md ${
                  !input.trim() || isLoading
                    ? "bg-slate-300 dark:bg-slate-700 cursor-not-allowed shadow-none"
                    : "bg-brand-primary hover:bg-blue-700 active:scale-95 shadow-blue-500/25"
                }`}
              >
                <Send size={18} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

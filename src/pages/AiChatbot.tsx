/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Bot,
  User,
  Sparkles,
  Globe,
  Trash2,
  Copy,
  Check,
  Volume2,
  ExternalLink,
  GraduationCap,
  Lightbulb,
  Mic,
  MicOff,
  Radio,
  Square,
  AlertCircle,
  Zap,
  MessageSquare,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useLanguage } from "../context/LanguageContext";
import { useStudent } from "../context/StudentContext";
import { auth } from "../lib/firebase";

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

const LIVE_VOICES = ["Zephyr", "Kore", "Puck", "Fenrir", "Charon"] as const;

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

function base64ToUint8Array(base64: string): Uint8Array {
  const bin = atob(base64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) {
    out[i] = bin.charCodeAt(i);
  }
  return out;
}

export default function AiChatbot() {
  const { language } = useLanguage();
  const { profile } = useStudent();
  const uz = language === "uz";

  const [activeTab, setActiveTab] = useState<"chat" | "live">("chat");

  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: "welcome-1",
      role: "assistant",
      text: uz
        ? `Assalomu alaykum! Men **Audio Darsliklar** platformasining aqlli AI Ustoziman.${
            profile.userType === "teacher"
              ? " O'qituvchi sifatida dars rejalari va metodik materiallarda yordam beraman."
              : profile.grade
              ? ` Siz **${profile.grade}-sinf** o'quvchisi ekanligingizni bilaman.`
              : ""
          } Sizga 1-11-sinf maktab darsliklari, mavzular tushuntirishi, test savollari va uyga vazifalar bo'yicha yordam berishga tayyorman.`
        : `Здравствуйте! Я умный ИИ Учитель платформы **Audio Darsliklar**.${
            profile.userType === "teacher"
              ? " Готов помочь вам с планами уроков и методикой."
              : profile.grade
              ? ` Я вижу, что вы учитесь в **${profile.grade} классе**.`
              : ""
          } Готов помочь вам с учебниками 1-11 классов, разъяснением тем и решением задач.`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [useSearch, setUseSearch] = useState(false);
  const [modelMode, setModelMode] = useState<"hydrogen" | "lite">("hydrogen");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  // Voice dictation (/api/transcribe) state
  const [isDictating, setIsDictating] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [dictateError, setDictateError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const dictationChunksRef = useRef<Blob[]>([]);
  const ttsAudioRef = useRef<HTMLAudioElement | null>(null);

  // Live API voice session state
  const [liveVoice, setLiveVoice] = useState<(typeof LIVE_VOICES)[number]>("Zephyr");
  const [liveStatus, setLiveStatus] = useState<"idle" | "connecting" | "connected" | "error">("idle");
  const [liveError, setLiveError] = useState<string | null>(null);
  const [liveTextInput, setLiveTextInput] = useState("");
  const [liveTranscripts, setLiveTranscripts] = useState<Array<{ id: string; role: "user" | "assistant"; text: string }>>([]);

  const liveWsRef = useRef<WebSocket | null>(null);
  const liveInCtxRef = useRef<AudioContext | null>(null);
  const liveOutCtxRef = useRef<AudioContext | null>(null);
  const liveStreamRef = useRef<MediaStream | null>(null);
  const liveProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const liveNextStartTimeRef = useRef<number>(0);
  const liveActiveSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const stopLiveSession = () => {
    try {
      liveProcessorRef.current?.disconnect();
    } catch {
      // ignore
    }
    liveProcessorRef.current = null;

    if (liveStreamRef.current) {
      liveStreamRef.current.getTracks().forEach((t) => t.stop());
      liveStreamRef.current = null;
    }

    for (const src of liveActiveSourcesRef.current) {
      try {
        src.stop();
      } catch {
        // ignore
      }
    }
    liveActiveSourcesRef.current.clear();

    try {
      liveInCtxRef.current?.close();
    } catch {
      // ignore
    }
    liveInCtxRef.current = null;

    try {
      liveOutCtxRef.current?.close();
    } catch {
      // ignore
    }
    liveOutCtxRef.current = null;

    if (liveWsRef.current) {
      try {
        liveWsRef.current.close();
      } catch {
        // ignore
      }
      liveWsRef.current = null;
    }

    liveNextStartTimeRef.current = 0;
    setLiveStatus("idle");
  };

  useEffect(() => {
    return () => {
      stopLiveSession();
      ttsAudioRef.current?.pause();
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

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
    setDictateError(null);

    try {
      const chatHistory = messages
        .filter((m) => m.id !== "welcome-1" && m.id !== "welcome-reset")
        .map((m) => ({
          role: m.role,
          text: m.text,
        }));

      const token = await auth.currentUser?.getIdToken().catch(() => undefined);
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await fetch("/api/chat", {
        method: "POST",
        headers,
        body: JSON.stringify({
          messages: chatHistory,
          message: textToSend.trim(),
          useSearch,
          modelMode,
          persona: "tutor",
          grade: profile.grade,
          userType: profile.userType,
        }),
      });

      const data = await res.json().catch(() => ({}));

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
        text: uz
          ? `Xatolik yuz berdi: ${err.message || "Internet aloqasi yoki xizmatda uzilish"}.`
          : `Ошибка: ${err.message || "Сбой связи с сервисом"}.`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorBotMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleDictation = async () => {
    setDictateError(null);
    if (isDictating && mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsDictating(false);
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setDictateError(
        uz
          ? "Brauzeringizda mikrofon orqali yozish qo'llab-quvvatlanmaydi."
          : "Ваш браузер не поддерживает запись с микрофона."
      );
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      dictationChunksRef.current = [];

      recorder.ondataavailable = (ev) => {
        if (ev.data.size > 0) dictationChunksRef.current.push(ev.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(dictationChunksRef.current, { type: recorder.mimeType || "audio/webm" });
        if (blob.size === 0) return;

        setIsTranscribing(true);
        try {
          const buf = await blob.arrayBuffer();
          const b64 = arrayBufferToBase64(buf);
          const res = await fetch("/api/transcribe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              audioBase64: b64,
              mimeType: recorder.mimeType || "audio/webm",
              lang: uz ? "uz" : "ru",
            }),
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok) {
            throw new Error(data.error || "Ovozni matnga aylantirib bo'lmadi.");
          }
          if (data.text) {
            setInput((prev) => (prev ? `${prev} ${data.text}` : data.text));
          }
        } catch (err: any) {
          setDictateError(err?.message || "Transkripsiya xatoligi.");
        } finally {
          setIsTranscribing(false);
        }
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsDictating(true);
    } catch (err: any) {
      setDictateError(
        uz
          ? `Mikrofonga ruxsat berilmadi: ${err?.message || "Mikrofon topilmadi"}`
          : `Нет доступа к микрофону: ${err?.message || "Устройство не найдено"}`
      );
    }
  };

  const appendLiveTranscript = (role: "user" | "assistant", chunk: string) => {
    const clean = chunk.trim();
    if (!clean) return;
    setLiveTranscripts((prev) => {
      const last = prev[prev.length - 1];
      if (last && last.role === role) {
        const updated = [...prev];
        updated[updated.length - 1] = {
          ...last,
          text: `${last.text} ${clean}`.replace(/\s+/g, " ").trim(),
        };
        return updated;
      }
      return [...prev, { id: `lt-${Date.now()}-${Math.random()}`, role, text: clean }];
    });
  };

  const playPcm24Chunk = (base64Pcm: string) => {
    const outCtx = liveOutCtxRef.current;
    if (!outCtx) return;

    const bytes = base64ToUint8Array(base64Pcm);
    const int16 = new Int16Array(bytes.buffer, bytes.byteOffset, Math.floor(bytes.byteLength / 2));
    if (int16.length === 0) return;

    const audioBuffer = outCtx.createBuffer(1, int16.length, 24000);
    const channelData = audioBuffer.getChannelData(0);
    for (let i = 0; i < int16.length; i++) {
      channelData[i] = int16[i] / 32768;
    }

    const src = outCtx.createBufferSource();
    src.buffer = audioBuffer;
    src.connect(outCtx.destination);

    const startTime = Math.max(outCtx.currentTime, liveNextStartTimeRef.current);
    src.start(startTime);
    liveNextStartTimeRef.current = startTime + audioBuffer.duration;

    liveActiveSourcesRef.current.add(src);
    src.onended = () => {
      liveActiveSourcesRef.current.delete(src);
    };
  };

  const handleStartLiveSession = async () => {
    setLiveError(null);
    stopLiveSession();
    setLiveStatus("connecting");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      liveStreamRef.current = stream;

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const inCtx = new AudioCtx({ sampleRate: 16000 });
      const outCtx = new AudioCtx({ sampleRate: 24000 });
      liveInCtxRef.current = inCtx;
      liveOutCtxRef.current = outCtx;
      liveNextStartTimeRef.current = outCtx.currentTime;

      const proto = window.location.protocol === "https:" ? "wss" : "ws";
      const gradeQ = profile.grade ? `&grade=${encodeURIComponent(profile.grade)}` : "";
      const wsUrl = `${proto}://${window.location.host}/api/live?voice=${encodeURIComponent(liveVoice)}&lang=${uz ? "uz" : "ru"}${gradeQ}`;
      const ws = new WebSocket(wsUrl);
      liveWsRef.current = ws;

      ws.onmessage = (ev) => {
        try {
          const msg = JSON.parse(ev.data);
          if (msg.error) {
            setLiveError(msg.error);
            setLiveStatus("error");
            return;
          }
          if (msg.ready) {
            setLiveStatus("connected");
            const source = inCtx.createMediaStreamSource(stream);
            const processor = inCtx.createScriptProcessor(4096, 1, 1);
            liveProcessorRef.current = processor;

            processor.onaudioprocess = (e) => {
              if (!liveWsRef.current || liveWsRef.current.readyState !== WebSocket.OPEN) return;
              const floatData = e.inputBuffer.getChannelData(0);
              const int16 = new Int16Array(floatData.length);
              for (let i = 0; i < floatData.length; i++) {
                const s = Math.max(-1, Math.min(1, floatData[i]));
                int16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
              }
              liveWsRef.current.send(JSON.stringify({ audio: arrayBufferToBase64(int16.buffer) }));
            };

            source.connect(processor);
            processor.connect(inCtx.destination);
          }
          if (msg.inputTranscript) {
            appendLiveTranscript("user", msg.inputTranscript);
          }
          if (msg.outputTranscript) {
            appendLiveTranscript("assistant", msg.outputTranscript);
          }
          if (msg.audio) {
            playPcm24Chunk(msg.audio);
          }
          if (msg.interrupted) {
            for (const src of liveActiveSourcesRef.current) {
              try {
                src.stop();
              } catch {
                // ignore
              }
            }
            liveActiveSourcesRef.current.clear();
            liveNextStartTimeRef.current = outCtx.currentTime;
          }
        } catch {
          // ignore malformed messages
        }
      };

      ws.onerror = () => {
        setLiveError(uz ? "Jonli ovozli ulanishda xatolik yuz berdi." : "Ошибка подключения Live-сессии.");
        setLiveStatus("error");
      };

      ws.onclose = () => {
        if (liveWsRef.current === ws) {
          stopLiveSession();
        }
      };
    } catch (err: any) {
      stopLiveSession();
      setLiveError(
        uz
          ? `Mikrofon yoki Live API ulanmadi: ${err?.message || "Ruxsat berilmadi"}`
          : `Не удалось запустить голосовой режим: ${err?.message || "Нет доступа"}`
      );
      setLiveStatus("error");
    }
  };

  const handleSendLiveText = (e: React.FormEvent) => {
    e.preventDefault();
    const txt = liveTextInput.trim();
    if (!txt || !liveWsRef.current || liveWsRef.current.readyState !== WebSocket.OPEN) return;
    liveWsRef.current.send(JSON.stringify({ text: txt }));
    appendLiveTranscript("user", txt);
    setLiveTextInput("");
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSpeak = async (id: string, textToRead: string) => {
    if (speakingId === id) {
      ttsAudioRef.current?.pause();
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }

    ttsAudioRef.current?.pause();
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    setSpeakingId(id);

    try {
      const cleanText = textToRead.replace(/[*#_`>]/g, "").slice(0, 600);
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: cleanText, voice: "Kore" }),
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok && data.audioBase64) {
        const audio = new Audio(`data:audio/wav;base64,${data.audioBase64}`);
        ttsAudioRef.current = audio;
        audio.onended = () => setSpeakingId(null);
        audio.onerror = () => setSpeakingId(null);
        await audio.play();
        return;
      }
    } catch {
      // fallback below
    }

    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(textToRead.replace(/[*#_`>]/g, "").slice(0, 500));
      utterance.lang = uz ? "uz-UZ" : "ru-RU";
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
        text: uz
          ? "Muloqot tozalandi. Yangi savollaringiz bo'lsa, marhamat!"
          : "Чат очищен. Готов к новым вопросам!",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto flex flex-col">
      {/* Top Banner Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-6 mb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-brand-primary dark:text-blue-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles size={14} />
            <span>{uz ? "Aqlli Virtual Ustoz" : "Умный виртуальный учитель"}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {uz ? "AI Darslik & Repetitor Chatboti" : "ИИ Школьный Репетитор"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {uz
              ? "Matnli muloqot, ovozli savol berish va jonli suhbat — barcha maktab fanlari bo'yicha yordamchi."
              : "Текстовый чат, голосовой ввод и живое общение по всем школьным предметам."}
          </p>
        </div>

        {/* Mode & Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setActiveTab("chat")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition-all ${
                activeTab === "chat"
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              <MessageSquare size={14} />
              <span>{uz ? "Matnli Chat" : "Текстовый чат"}</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("live")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition-all ${
                activeTab === "live"
                  ? "bg-brand-primary text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              <Radio size={14} />
              <span>{uz ? "Jonli Ovoz (Live)" : "Живой голос"}</span>
            </button>
          </div>

          {activeTab === "chat" && (
            <>
              <button
                type="button"
                onClick={() => setModelMode((m) => (m === "hydrogen" ? "lite" : "hydrogen"))}
                className={`px-3 py-2 rounded-2xl border text-xs font-bold inline-flex items-center gap-1.5 transition-all ${
                  modelMode === "lite"
                    ? "bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800"
                    : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800"
                }`}
                title={uz ? "Tezkor yoki batafsil model rejimi" : "Режим скорости модели"}
              >
                <Zap size={14} />
                <span>{modelMode === "lite" ? (uz ? "Tezkor" : "Быстрый") : (uz ? "Batafsil" : "Подробный")}</span>
              </button>

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
                <Globe size={15} />
                <span>{uz ? "Qidiruv" : "Поиск"}</span>
              </button>

              <button
                type="button"
                onClick={handleClear}
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-2xl border border-slate-200 dark:border-slate-800 transition-colors"
                title="Suhbatni tozalash"
              >
                <Trash2 size={16} />
              </button>
            </>
          )}
        </div>
      </div>

      {activeTab === "live" ? (
        /* REAL-TIME LIVE VOICE AI TUTOR */
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Radio size={20} className={liveStatus === "connected" ? "text-emerald-500 animate-pulse" : "text-brand-primary"} />
                <span>{uz ? "Jonli Ovozli AI Ustoz (Real-Time)" : "Живой голосовой ИИ-учитель"}</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                {uz
                  ? "Mikrofon orqali bevosita gaplashing — AI ustoz sizni tinglaydi va jonli ovozda javob qaytaradi."
                  : "Общайтесь голосом напрямую в реальном времени с ИИ-наставником."}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={liveVoice}
                onChange={(e) => setLiveVoice(e.target.value as any)}
                disabled={liveStatus === "connected" || liveStatus === "connecting"}
                className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-100"
              >
                {LIVE_VOICES.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>

              {liveStatus === "connected" || liveStatus === "connecting" ? (
                <button
                  type="button"
                  onClick={stopLiveSession}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black inline-flex items-center gap-1.5"
                >
                  <Square size={14} />
                  <span>{uz ? "Suhbatni yakunlash" : "Завершить"}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleStartLiveSession}
                  className="px-5 py-2.5 rounded-xl bg-brand-primary hover:bg-blue-700 text-white text-xs font-black inline-flex items-center gap-2 shadow-md shadow-blue-500/20"
                >
                  <Mic size={15} />
                  <span>{uz ? "Jonli Suhbatni Boshlash" : "Начать разговор"}</span>
                </button>
              )}
            </div>
          </div>

          {liveError && (
            <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs font-semibold text-red-700 dark:text-red-300 flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{liveError}</span>
            </div>
          )}

          {/* Live Wave & Status Box */}
          <div className="p-6 rounded-2xl bg-slate-950 text-white flex flex-col items-center justify-center text-center gap-3">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
              liveStatus === "connected"
                ? "bg-emerald-500/20 border-2 border-emerald-400 text-emerald-300 animate-pulse"
                : liveStatus === "connecting"
                ? "bg-blue-500/20 border-2 border-blue-400 text-blue-300 animate-spin"
                : "bg-slate-800 border border-slate-700 text-slate-400"
            }`}>
              <Radio size={26} />
            </div>
            <p className="text-sm font-bold">
              {liveStatus === "connected"
                ? uz
                  ? "Ulandi — gapirishingiz mumkin!"
                  : "Подключено — говорите!"
                : liveStatus === "connecting"
                ? uz
                  ? "Jonli ovoz kanali ulanmoqda..."
                  : "Подключение голосового канала..."
                : uz
                ? "Boshlash uchun yuqoridagi «Jonli Suhbatni Boshlash» tugmasini bosing"
                : "Нажмите «Начать разговор» для подключения"}
            </p>
          </div>

          {/* Live transcripts log */}
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {liveTranscripts.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">
                {uz ? "Suhbat matni bu yerda real vaqtda ko'rinadi." : "Расшифровка диалога появится здесь."}
              </p>
            ) : (
              liveTranscripts.map((item) => (
                <div
                  key={item.id}
                  className={`p-3 rounded-2xl text-xs leading-relaxed ${
                    item.role === "user"
                      ? "bg-blue-50 dark:bg-blue-950/40 text-slate-900 dark:text-slate-100 ml-8"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 mr-8"
                  }`}
                >
                  <span className="font-black mr-1.5">
                    {item.role === "user" ? (uz ? "Siz:" : "Вы:") : "AI Ustoz:"}
                  </span>
                  <span>{item.text}</span>
                </div>
              ))
            )}
          </div>

          {liveStatus === "connected" && (
            <form onSubmit={handleSendLiveText} className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <input
                type="text"
                value={liveTextInput}
                onChange={(e) => setLiveTextInput(e.target.value)}
                placeholder={uz ? "Yoki matn bilan savol yuboring..." : "Или отправьте текст в голосовой чат..."}
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
              />
              <button
                type="submit"
                disabled={!liveTextInput.trim()}
                className="px-4 py-2.5 rounded-xl bg-brand-primary text-white text-xs font-bold disabled:opacity-50"
              >
                {uz ? "Yuborish" : "Отправить"}
              </button>
            </form>
          )}
        </div>
      ) : (
        /* MAIN CHAT LAYOUT: 2 COLUMNS ON DESKTOP */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
          {/* Left Side: Preset questions & Tips (4 cols) */}
          <div className="lg:col-span-4 space-y-5 hidden md:block">
            <div className="p-4 rounded-3xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-brand-primary text-white flex items-center justify-center font-bold">
                  <GraduationCap size={20} />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    {profile.userType === "teacher"
                      ? uz
                        ? "Profil turi"
                        : "Тип профиля"
                      : uz
                      ? "O'quvchi ma'lumoti"
                      : "Данные ученика"}
                  </h3>
                  <p className="text-sm font-black text-slate-900 dark:text-white">
                    {profile.userType === "teacher"
                      ? uz
                        ? "Maktab o'qituvchisi"
                        : "Школьный учитель"
                      : profile.grade
                      ? `${profile.grade}${uz ? "-sinf o'quvchisi" : " класс"}`
                      : uz
                      ? "Umumiy darsliklar"
                      : "Все классы"}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Lightbulb size={14} className="text-amber-500" />
                <span>{uz ? "Tezkor Savol Namunalari" : "Примеры вопросов"}</span>
              </h3>

              {PRESETS.map((cat, idx) => (
                <div key={idx} className="space-y-1.5">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <span>{cat.icon}</span>
                    <span>{uz ? cat.categoryUz : cat.categoryRu}</span>
                  </span>
                  <div className="space-y-1">
                    {(uz ? cat.promptsUz : cat.promptsRu).map((prompt, pIdx) => (
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
                      <div className="markdown-content">
                        <ReactMarkdown>{msg.text}</ReactMarkdown>
                      </div>

                      {msg.groundingChunks && msg.groundingChunks.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-700/60 space-y-1.5 text-xs">
                          <span className="font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                            <Globe size={12} />
                            <span>{uz ? "Manbalar & Havolalar:" : "Источники:"}</span>
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

                      <div
                        className={`mt-2 flex items-center gap-3 text-[11px] ${
                          isUser ? "text-blue-200 justify-end" : "text-slate-400 justify-between"
                        }`}
                      >
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
                              <span>
                                {speakingId === msg.id
                                  ? uz
                                    ? "To'xtatish"
                                    : "Стоп"
                                  : uz
                                  ? "Tinglash"
                                  : "Слушать"}
                              </span>
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
                    <div className="w-2 h-2 rounded-full bg-brand-primary animate-bounce" />
                    <div className="w-2 h-2 rounded-full bg-brand-primary animate-bounce [animation-delay:0.2s]" />
                    <div className="w-2 h-2 rounded-full bg-brand-primary animate-bounce [animation-delay:0.4s]" />
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium ml-1">
                      {uz ? "AI Ustoz o'ylamoqda..." : "ИИ Учитель думает..."}
                    </span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Box */}
            <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 space-y-2">
              {dictateError && (
                <p className="text-[11px] font-semibold text-red-600 dark:text-red-400 flex items-center gap-1.5">
                  <AlertCircle size={13} />
                  <span>{dictateError}</span>
                </p>
              )}

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-end gap-2"
              >
                <button
                  type="button"
                  onClick={handleToggleDictation}
                  disabled={isTranscribing || isLoading}
                  title={uz ? "Ovoz bilan savol yozish (Transkripsiya)" : "Голосовой ввод"}
                  className={`p-3.5 rounded-2xl border font-bold flex items-center justify-center transition-all ${
                    isDictating
                      ? "bg-red-600 text-white border-red-600 animate-pulse"
                      : isTranscribing
                      ? "bg-amber-50 dark:bg-amber-950/40 text-amber-600 border-amber-300"
                      : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-brand-primary"
                  }`}
                >
                  {isDictating ? <MicOff size={18} /> : <Mic size={18} />}
                </button>

                <textarea
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
                    isDictating
                      ? uz
                        ? "Gapiravering — to'xtatish uchun mikrofon tugmasini bosing..."
                        : "Говорите — нажмите еще раз для остановки..."
                      : isTranscribing
                      ? uz
                        ? "Ovoz matnga aylantirilmoqda..."
                        : "Распознавание речи..."
                      : uz
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
      )}
    </div>
  );
}

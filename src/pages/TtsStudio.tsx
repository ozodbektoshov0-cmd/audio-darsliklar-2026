/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import {
  Volume2,
  Download,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  FileText,
  Copy,
  Check,
  Trash2,
  Headphones,
  Music,
  Clock,
  Mic,
  MicOff,
  Upload,
  Users,
  AlertCircle,
  MessageSquare,
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

interface VoiceOption {
  id: string;
  name: string;
  gender: "ayol" | "erkak";
  descUz: string;
  descRu: string;
  badge?: string;
}

const VOICES: VoiceOption[] = [
  {
    id: "Kore",
    name: "Kore",
    gender: "ayol",
    descUz: "Mayin, ravon va yoqimli darslik ovozi",
    descRu: "Мягкий, плавный и приятный голос диктора",
    badge: "Tavsiya",
  },
  {
    id: "Puck",
    name: "Puck",
    gender: "erkak",
    descUz: "Jonli, shijoatli yosh ovoz",
    descRu: "Живой, энергичный юношеский голос",
  },
  {
    id: "Fenrir",
    name: "Fenrir",
    gender: "erkak",
    descUz: "Salobatli, ishonchli va jiddiy ovoz",
    descRu: "Уверенный, солидный и глубокий мужской голос",
  },
  {
    id: "Zephyr",
    name: "Zephyr",
    gender: "ayol",
    descUz: "Xotirjam, muloyim audio-kitob ovozi",
    descRu: "Спокойный, мягкий голос для аудиокниг",
  },
  {
    id: "Charon",
    name: "Charon",
    gender: "erkak",
    descUz: "Klassik radio diktori va she'riyat ohangi",
    descRu: "Классический диктор радио и поэзии",
  },
];

interface SampleText {
  titleUz: string;
  titleRu: string;
  text: string;
  dialogue?: boolean;
}

const SAMPLE_TEXTS: SampleText[] = [
  {
    titleUz: "Alisher Navoiy ruboiysi",
    titleRu: "Рубаи Алишера Навои",
    text: "Gʻurbatda gʻarib shodmon boʻlmas emish,\nEl anga necha mehribon boʻlmas emish.\nOltin qafas ichra gar qizil gul bitsa,\nBulbulga tikandek oshiyon boʻlmas emish.",
  },
  {
    titleUz: "Ona tili (Ot so'z turkumi)",
    titleRu: "Родной язык (Имя существительное)",
    text: "Ot so'z turkumi shaxs, narsa va hodisalarning nomini bildirib, kim? nima? qayer? so'roqlariga javob bo'ladi. Masalan: maktab, kitob, o'qituvchi, quyosh.",
  },
  {
    titleUz: "Fizika (Nyuton 1-qonuni)",
    titleRu: "Физика (1-й закон Ньютона)",
    text: "Jismga boshqa jismlar ta'sir qilmasa yoki ularning ta'siri kompensatsiyalashgan bo'lsa, jism o'zining tinch holatini yoki to'g'ri chiziqli tekis harakatini saqlaydi. Bu inersiya qonunidir.",
  },
  {
    titleUz: "Ustoz va O'quvchi dialogi",
    titleRu: "Диалог учителя и ученика",
    dialogue: true,
    text: "Ustoz: Bugungi darsimizda kvadrat tenglamalarni diskriminant usuli bilan yechishni o'rganamiz.\nO'quvchi: Ustoz, agar diskriminant noldan kichik chiqsa-chi?\nUstoz: Ajoyib savol! Unda tenglamaning haqiqiy ildizlari mavjud bo'lmaydi.",
  },
];

interface GeneratedAudioItem {
  id: string;
  text: string;
  voice: string;
  audioUrl: string;
  date: string;
}

type StudioTab = "single" | "dialogue" | "transcribe";

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

export default function TtsStudio() {
  const { language } = useLanguage();
  const uz = language === "uz";

  const [studioTab, setStudioTab] = useState<StudioTab>("single");
  const [text, setText] = useState("");
  const [stylePrompt, setStylePrompt] = useState("");
  const [selectedVoice, setSelectedVoice] = useState("Kore");
  const [selectedVoice2, setSelectedVoice2] = useState("Puck");
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [canUseBrowserFallback, setCanUseBrowserFallback] = useState(false);
  const [currentAudioUrl, setCurrentAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [copied, setCopied] = useState(false);

  // Audio -> Text (Transkripsiya) state
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcriptText, setTranscriptText] = useState("");
  const [transcribeError, setTranscribeError] = useState<string | null>(null);
  const [copiedTranscript, setCopiedTranscript] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const [audioHistory, setAudioHistory] = useState<GeneratedAudioItem[]>(() => {
    try {
      const saved = localStorage.getItem("audio_darslik_tts_history");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    try {
      localStorage.setItem(
        "audio_darslik_tts_history",
        JSON.stringify(audioHistory.slice(0, 10).map((h) => ({ ...h, audioUrl: "" })))
      );
    } catch {
      // ignore quota error
    }
  }, [audioHistory]);

  useEffect(() => {
    return () => {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const handleGenerate = async () => {
    if (!text.trim()) {
      setErrorMsg(uz ? "Iltimos, avval matn kiriting!" : "Пожалуйста, введите текст!");
      return;
    }

    setIsGenerating(true);
    setErrorMsg(null);
    setCanUseBrowserFallback(false);

    try {
      const mode = studioTab === "dialogue" ? "dialogue" : "single";
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          text: text.trim(),
          voice: selectedVoice,
          voice2: selectedVoice2,
          stylePrompt: stylePrompt.trim(),
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setCanUseBrowserFallback("speechSynthesis" in window);
        throw new Error(data.error || "Audio sintez qilishda xatolik yuz berdi");
      }

      if (!data.audioBase64) {
        setCanUseBrowserFallback("speechSynthesis" in window);
        throw new Error(uz ? "Olingan javobda audio ma'lumot mavjud emas." : "Аудио не получено.");
      }

      const audioUrl = `data:audio/wav;base64,${data.audioBase64}`;
      setCurrentAudioUrl(audioUrl);

      const newItem: GeneratedAudioItem = {
        id: `tts-${Date.now()}`,
        text: text.trim().slice(0, 120),
        voice: data.voice || (mode === "dialogue" ? `${selectedVoice}+${selectedVoice2}` : selectedVoice),
        audioUrl,
        date: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setAudioHistory((prev) => [newItem, ...prev]);

      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.playbackRate = playbackSpeed;
        audioRef.current.play().catch(() => {});
        setIsPlaying(true);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || (uz ? "Xatolik yuz berdi" : "Произошла ошибка"));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleBrowserSpeechFallback = () => {
    if (!("speechSynthesis" in window) || !text.trim()) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text.trim());
    utterance.rate = playbackSpeed;
    utterance.lang = uz ? "uz-UZ" : "ru-RU";
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);
    setIsPlaying(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleDownload = (customUrl?: string, customFilename?: string) => {
    const url = customUrl || currentAudioUrl;
    if (!url) return;

    const link = document.createElement("a");
    link.href = url;
    link.download = customFilename || `darslik-audio-${selectedVoice}-${Date.now()}.wav`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Transcribe audio helper
  const sendAudioToTranscribe = async (buffer: ArrayBuffer, mimeType: string) => {
    if (buffer.byteLength > 4 * 1024 * 1024) {
      setTranscribeError(uz ? "Audio fayl hajmi 4 MB dan oshmasligi kerak." : "Размер аудиофайла не должен превышать 4 МБ.");
      return;
    }
    setIsTranscribing(true);
    setTranscribeError(null);
    try {
      const audioBase64 = arrayBufferToBase64(buffer);
      const res = await fetch("/api/transcribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ audioBase64, mimeType, lang: uz ? "uz" : "ru" }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Transkripsiya xatoligi.");
      }
      setTranscriptText(data.text || "");
    } catch (err: any) {
      setTranscribeError(err?.message || "Audioni matnga aylantirib bo'lmadi.");
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleToggleRecording = async () => {
    setTranscribeError(null);
    if (isRecording && mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setTranscribeError(
        uz
          ? "Brauzeringizda mikrofon yozuvi mavjud emas. Audio fayl yuklab ko'ring."
          : "Запись с микрофона не поддерживается. Загрузите аудиофайл."
      );
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (ev) => {
        if (ev.data.size > 0) chunksRef.current.push(ev.data);
      };
      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
        if (blob.size > 0) {
          const buf = await blob.arrayBuffer();
          await sendAudioToTranscribe(buf, recorder.mimeType || "audio/webm");
        }
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
    } catch (err: any) {
      setTranscribeError(
        uz
          ? `Mikrofon ulanmadi: ${err?.message || "Ruxsat berilmadi"}`
          : `Нет доступа к микрофону: ${err?.message || "Ошибка"}`
      );
    }
  };

  const handleAudioFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const buf = await file.arrayBuffer();
    await sendAudioToTranscribe(buf, file.type || "audio/mp3");
    e.target.value = "";
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      <audio
        ref={audioRef}
        onTimeUpdate={() => {
          if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
            setDuration(audioRef.current.duration || 0);
          }
        }}
        onEnded={() => setIsPlaying(false)}
        onPause={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
      />

      {/* Header Banner */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-brand-primary dark:text-blue-400 text-xs font-bold uppercase tracking-wider mb-4">
          <Headphones size={15} />
          <span>{uz ? "Audio Darslik Studiyasi" : "Студия создания аудио"}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-4">
          {uz ? (
            <>
              Matnni <span className="text-brand-primary">Ovozga Aylantirish</span> & .WAV Yuklab Olish
            </>
          ) : (
            <>
              Преобразование текста в <span className="text-brand-primary">Речь (TTS)</span> & Скачать .WAV
            </>
          )}
        </h1>
        <p className="max-w-2xl mx-auto text-slate-600 dark:text-slate-400 text-base sm:text-lg">
          {uz
            ? "Yakka ovozli darslik, Ustoz-O'quvchi dialogi yoki audioni matnga aylantirish (Transkripsiya) — hammasi bitta studiyada."
            : "Озвучка текста, диалоги и расшифровка аудио в текст (транскрипция) в одной студии."}
        </p>

        {/* Studio Mode Tabs */}
        <div className="mt-6 inline-flex flex-wrap justify-center gap-1.5 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onClick={() => setStudioTab("single")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold inline-flex items-center gap-2 transition-all ${
              studioTab === "single"
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                : "text-slate-600 dark:text-slate-300 hover:text-brand-primary"
            }`}
          >
            <Volume2 size={15} />
            <span>{uz ? "Yakka Ovoz (TTS)" : "Одиночный голос"}</span>
          </button>
          <button
            type="button"
            onClick={() => setStudioTab("dialogue")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold inline-flex items-center gap-2 transition-all ${
              studioTab === "dialogue"
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                : "text-slate-600 dark:text-slate-300 hover:text-brand-primary"
            }`}
          >
            <Users size={15} />
            <span>{uz ? "Ustoz + O'quvchi Dialog" : "Диалог (2 голоса)"}</span>
          </button>
          <button
            type="button"
            onClick={() => setStudioTab("transcribe")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold inline-flex items-center gap-2 transition-all ${
              studioTab === "transcribe"
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                : "text-slate-600 dark:text-slate-300 hover:text-brand-primary"
            }`}
          >
            <Mic size={15} />
            <span>{uz ? "Audio → Matn" : "Аудио → Текст"}</span>
          </button>
        </div>
      </div>

      {studioTab === "transcribe" ? (
        /* AUDIO TO TEXT TRANSCRIPTION TAB */
        <div className="max-w-3xl mx-auto bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Mic size={20} className="text-brand-primary" />
              <span>{uz ? "Nutq va Audioni Matnga Aylantirish" : "Расшифровка аудио в текст"}</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              {uz
                ? "Mikrofondan yozib oling yoki tayyor audio fayl (WAV, MP3, WEBM, 4 MB gacha) yuklang — Gemini matnga aylantirib beradi."
                : "Запишите речь с микрофона или загрузите аудиофайл (до 4 МБ) для точной расшифровки."}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handleToggleRecording}
              disabled={isTranscribing}
              className={`py-4 px-5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2.5 transition-all ${
                isRecording
                  ? "bg-red-600 hover:bg-red-700 text-white animate-pulse"
                  : "bg-brand-primary hover:bg-blue-700 text-white shadow-md shadow-blue-500/20"
              }`}
            >
              {isRecording ? <MicOff size={18} /> : <Mic size={18} />}
              <span>
                {isRecording
                  ? uz
                    ? "Yozuvni to'xtatish va yuborish"
                    : "Остановить и расшифровать"
                  : uz
                  ? "Mikrofondan yozish"
                  : "Записать с микрофона"}
              </span>
            </button>

            <label className="py-4 px-5 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-brand-primary text-slate-700 dark:text-slate-200 font-bold text-sm flex items-center justify-center gap-2.5 cursor-pointer transition-colors">
              <Upload size={18} />
              <span>{uz ? "Audio fayl yuklash (<= 4 MB)" : "Загрузить аудио (<= 4 МБ)"}</span>
              <input type="file" accept="audio/*" onChange={handleAudioFileUpload} className="hidden" />
            </label>
          </div>

          {isTranscribing && (
            <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-brand-primary dark:text-blue-300 text-xs font-bold flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
              <span>{uz ? "Audio tahlil qilinmoqda va matnga aylantirilmoqda..." : "Распознавание речи..."}</span>
            </div>
          )}

          {transcribeError && (
            <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-xs font-semibold flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{transcribeError}</span>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {uz ? "Olingan Matn:" : "Результат:"}
              </span>
              {transcriptText && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(transcriptText);
                      setCopiedTranscript(true);
                      setTimeout(() => setCopiedTranscript(false), 2000);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 inline-flex items-center gap-1"
                  >
                    {copiedTranscript ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                    <span>{uz ? "Nusxa" : "Копия"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setText(transcriptText);
                      setStudioTab("single");
                    }}
                    className="px-3 py-1 rounded-lg bg-brand-primary text-white text-xs font-bold inline-flex items-center gap-1"
                  >
                    <MessageSquare size={13} />
                    <span>{uz ? "TTS ga yuborish" : "В озвучку"}</span>
                  </button>
                </div>
              )}
            </div>
            <textarea
              rows={6}
              value={transcriptText}
              onChange={(e) => setTranscriptText(e.target.value)}
              placeholder={uz ? "Transkripsiya natijasi shu yerda chiqadi..." : "Здесь появится текст..."}
              className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-sm text-slate-800 dark:text-slate-100"
            />
          </div>
        </div>
      ) : (
        /* SINGLE & DIALOGUE TTS WORKSPACE */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 transition-all">
              <div className="flex items-center justify-between gap-2 mb-3">
                <label
                  htmlFor="tts-text-input"
                  className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2"
                >
                  <FileText size={16} className="text-brand-primary" />
                  <span>
                    {studioTab === "dialogue"
                      ? uz
                        ? "Dialog matni (har bir qator navbatdagi so'zlovchi)"
                        : "Текст диалога (каждая строка — следующая реплика)"
                      : uz
                      ? "Ovoz beriladigan matn"
                      : "Текст для озвучивания"}
                  </span>
                </label>

                <div className="flex items-center gap-1.5">
                  {text && (
                    <>
                      <button
                        type="button"
                        onClick={handleCopy}
                        className="p-1.5 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1"
                      >
                        {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                        <span>{copied ? "Nusxa olindi" : "Nusxa"}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setText("")}
                        className="p-1.5 text-xs text-red-500 hover:text-red-700 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors flex items-center gap-1"
                      >
                        <Trash2 size={14} />
                        <span>{uz ? "Tozalash" : "Очистить"}</span>
                      </button>
                    </>
                  )}
                </div>
              </div>

              <textarea
                id="tts-text-input"
                rows={7}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={
                  studioTab === "dialogue"
                    ? uz
                      ? "Ustoz: Bugun qaysi mavzuni takrorlaymiz?\nO'quvchi: Alisher Navoiy g'azallarini tahlil qilaylik!"
                      : "Учитель: Какую тему повторим?\nУченик: Давайте разберем новую тему!"
                    : uz
                    ? "Darslikdan biror bob, she'r yoki konspektingizni shu yerga yozing..."
                    : "Напишите или вставьте сюда любой текст из учебника..."
                }
                className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-primary text-slate-800 dark:text-slate-100 text-sm leading-relaxed resize-y"
              />

              {studioTab === "single" && (
                <div className="mt-3">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1">
                    {uz ? "Ovoz ohangi / uslubi (ixtiyoriy):" : "Стиль и интонация (необязательно):"}
                  </label>
                  <input
                    type="text"
                    value={stylePrompt}
                    onChange={(e) => setStylePrompt(e.target.value)}
                    placeholder={uz ? "Masalan: Xotirjam, aniq diktor ohangi" : "Например: Спокойный дикторский тон"}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100"
                  />
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mt-2 px-1">
                <span>
                  {text.length} {uz ? "belgi" : "символов"} · {text.trim() ? text.trim().split(/\s+/).length : 0}{" "}
                  {uz ? "so'z" : "слов"}
                </span>
                <span>
                  ~{Math.max(1, Math.round((text.trim().split(/\s+/).length || 0) / 2.5))}{" "}
                  {uz ? "sekundlik audio" : "сек. звучания"}
                </span>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-2">
                  {uz ? "Tayyor namuna matnlar:" : "Готовые образцы текстов:"}
                </span>
                <div className="flex flex-wrap gap-2">
                  {SAMPLE_TEXTS.map((sample, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setText(sample.text);
                        if (sample.dialogue) setStudioTab("dialogue");
                      }}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-brand-primary hover:text-white transition-all text-left"
                    >
                      ✨ {uz ? sample.titleUz : sample.titleRu}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Voice Selector */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
              <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Mic size={16} className="text-brand-primary" />
                <span>
                  {studioTab === "dialogue"
                    ? uz
                      ? "1-so'zlovchi (Ustoz) ovozini tanlang"
                      : "Голос 1 (Учитель)"
                    : uz
                    ? "AI Ovozni Tanlang"
                    : "Выберите голос ИИ"}
                </span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {VOICES.map((v) => {
                  const isSelected = selectedVoice === v.id;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setSelectedVoice(v.id)}
                      className={`p-3.5 rounded-2xl border text-left transition-all relative flex flex-col justify-between ${
                        isSelected
                          ? "border-brand-primary bg-blue-50/70 dark:bg-blue-950/40 ring-2 ring-brand-primary shadow-xs"
                          : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900 dark:text-white">{v.name}</span>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                            {v.gender === "ayol" ? "Ayol" : "Erkak"}
                          </span>
                        </div>
                        {v.badge && (
                          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500 text-white">
                            {v.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                        {uz ? v.descUz : v.descRu}
                      </p>
                    </button>
                  );
                })}
              </div>

              {studioTab === "dialogue" && (
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">
                    {uz ? "2-so'zlovchi (O'quvchi) ovozi:" : "Голос 2 (Ученик):"}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {VOICES.map((v) => (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setSelectedVoice2(v.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                          selectedVoice2 === v.id
                            ? "bg-brand-primary text-white border-brand-primary"
                            : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                        }`}
                      >
                        {v.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div>
              <button
                type="button"
                onClick={handleGenerate}
                disabled={isGenerating || !text.trim()}
                className={`w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-3 transition-all shadow-lg ${
                  isGenerating || !text.trim()
                    ? "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed shadow-none"
                    : "bg-brand-primary hover:bg-blue-700 active:scale-[0.99] text-white shadow-blue-500/25"
                }`}
              >
                {isGenerating ? (
                  <>
                    <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{uz ? "AI Ovoz Yaratilmoqda..." : "Синтез аудио..."}</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={20} />
                    <span>{uz ? "Ovozga Aylantirish & Tayyorlash" : "Озвучить текст"}</span>
                  </>
                )}
              </button>

              {errorMsg && (
                <div className="mt-3 p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-xs font-semibold space-y-2">
                  <div className="flex items-center gap-2">
                    <AlertCircle size={16} className="shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                  {canUseBrowserFallback && (
                    <button
                      type="button"
                      onClick={handleBrowserSpeechFallback}
                      className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-red-200 dark:border-red-800 text-slate-800 dark:text-slate-100 text-xs font-bold inline-flex items-center gap-1.5"
                    >
                      <Volume2 size={14} />
                      <span>{uz ? "Brauzer ovozida tinglash" : "Озвучить через браузер"}</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Audio Player & Instant .WAV Download (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white rounded-3xl p-6 shadow-xl border border-slate-800 relative overflow-hidden">
              <div className="absolute -right-16 -top-16 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                  <Music size={14} />
                  <span>{uz ? "Audio Player (.WAV)" : "Аудиоплеер (.WAV)"}</span>
                </span>

                {currentAudioUrl && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    {uz ? "Tayyor" : "Готово"}
                  </span>
                )}
              </div>

              {currentAudioUrl ? (
                <div className="space-y-5">
                  <div className="h-20 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center p-4">
                    <div className="flex items-center gap-1 w-full justify-center">
                      {Array.from({ length: 28 }).map((_, i) => (
                        <div
                          key={i}
                          className={`w-1 rounded-full transition-all duration-300 ${
                            isPlaying ? "bg-blue-400 animate-pulse" : "bg-white/20"
                          }`}
                          style={{
                            height: isPlaying
                              ? `${Math.max(8, Math.sin(i * 0.4 + currentTime * 5) * 40 + 20)}px`
                              : `${(i % 5) * 6 + 10}px`,
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <input
                      type="range"
                      min="0"
                      max={duration || 100}
                      value={currentTime}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        if (audioRef.current) audioRef.current.currentTime = val;
                        setCurrentTime(val);
                      }}
                      className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-blue-400"
                    />
                    <div className="flex justify-between text-[11px] text-slate-400 mt-1.5">
                      <span>{formatTime(currentTime)}</span>
                      <span>{formatTime(duration)}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 bg-white/10 p-1 rounded-xl">
                      {[1, 1.25, 1.5].map((spd) => (
                        <button
                          key={spd}
                          type="button"
                          onClick={() => handleSpeedChange(spd)}
                          className={`px-2 py-0.5 rounded-lg text-[11px] font-bold transition-all ${
                            playbackSpeed === spd ? "bg-white text-slate-900" : "text-white/70 hover:text-white"
                          }`}
                        >
                          {spd}x
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={togglePlay}
                      className="w-14 h-14 rounded-full bg-blue-500 hover:bg-blue-400 text-white flex items-center justify-center transition-all shadow-lg shadow-blue-500/40 active:scale-95"
                    >
                      {isPlaying ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (audioRef.current) {
                          audioRef.current.currentTime = 0;
                          audioRef.current.play();
                          setIsPlaying(true);
                        }
                      }}
                      title="Boshidan o'ynatish"
                      className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all"
                    >
                      <RotateCcw size={18} />
                    </button>
                  </div>

                  <div className="pt-2 border-t border-white/10 space-y-2">
                    <button
                      type="button"
                      onClick={() => handleDownload()}
                      className="w-full py-3.5 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 active:scale-[0.99] text-white font-black text-sm flex items-center justify-center gap-2.5 shadow-lg shadow-emerald-500/25 transition-all"
                    >
                      <Download size={18} />
                      <span>{uz ? ".WAV Faylni Yuklab Olish" : "Скачать .WAV файл"}</span>
                    </button>
                    <p className="text-[11px] text-center text-slate-400">
                      {uz
                        ? "24 kHz WAV formati telefon va kompyuterda bevosita ochiladi"
                        : "Файл WAV 24 кГц воспроизводится на любых устройствах"}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center text-slate-400 space-y-3">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400">
                    <Headphones size={28} />
                  </div>
                  <p className="text-sm font-semibold">
                    {uz ? "Hozircha audio yaratilmadi" : "Аудио пока не создано"}
                  </p>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto">
                    {uz
                      ? "Chapdagi maydonga matn yozing va 'Ovozga Aylantirish' tugmasini bosing"
                      : "Введите текст слева и нажмите кнопку 'Озвучить текст'"}
                  </p>
                </div>
              )}
            </div>

            {/* History */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <Clock size={16} className="text-brand-primary" />
                  <span>{uz ? "Yaqinda yaratilgan audiolaringiz" : "Недавно созданные"}</span>
                </h3>
                {audioHistory.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setAudioHistory([])}
                    className="text-[11px] text-red-500 hover:underline"
                  >
                    {uz ? "Tozalash" : "Очистить"}
                  </button>
                )}
              </div>

              {audioHistory.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">
                  {uz
                    ? "Siz yaratgan audiolarning tarixi shu yerda saqlanadi"
                    : "История созданных аудио появится здесь"}
                </p>
              ) : (
                <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                  {audioHistory.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">{item.text}</p>
                        <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                          <span className="font-bold text-brand-primary">{item.voice}</span>
                          <span>•</span>
                          <span>{item.date}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            if (!item.audioUrl) {
                              setText(item.text);
                              return;
                            }
                            setCurrentAudioUrl(item.audioUrl);
                            if (audioRef.current) {
                              audioRef.current.src = item.audioUrl;
                              audioRef.current.play();
                              setIsPlaying(true);
                            }
                          }}
                          className="p-2 bg-blue-50 dark:bg-slate-700 text-brand-primary dark:text-blue-400 rounded-xl hover:bg-brand-primary hover:text-white transition-all"
                          title="Tinglash"
                        >
                          <Play size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => item.audioUrl && handleDownload(item.audioUrl, `darslik-audio-${item.id}.wav`)}
                          disabled={!item.audioUrl}
                          className="p-2 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-xl hover:bg-emerald-600 hover:text-white transition-all disabled:opacity-40"
                          title=".wav yuklab olish"
                        >
                          <Download size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

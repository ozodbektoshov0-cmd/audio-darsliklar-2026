/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
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
  Share2,
  Info,
  Clock,
  Mic,
  AlertCircle
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
    titleUz: "Ingliz tili (Reading practice)",
    titleRu: "Английский язык (Текст для чтения)",
    text: "Reading books is one of the best habits for expanding your mind. Daily listening and reading enhance vocabulary and critical thinking for students of all ages.",
  },
];

interface GeneratedAudioItem {
  id: string;
  text: string;
  voice: string;
  audioUrl: string;
  date: string;
  duration?: number;
}

export default function TtsStudio() {
  const { language } = useLanguage();
  const [text, setText] = useState("");
  const [selectedVoice, setSelectedVoice] = useState("Kore");
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [currentAudioUrl, setCurrentAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [copied, setCopied] = useState(false);
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

  // Save history
  useEffect(() => {
    try {
      localStorage.setItem("audio_darslik_tts_history", JSON.stringify(audioHistory.slice(0, 10)));
    } catch (e) {
      console.warn("Could not save history to localStorage", e);
    }
  }, [audioHistory]);

  const handleGenerate = async () => {
    if (!text.trim()) {
      setErrorMsg(language === "uz" ? "Iltimos, avval matn kiriting!" : "Пожалуйста, введите текст!");
      return;
    }

    setIsGenerating(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: text.trim(),
          voice: selectedVoice,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Audio sintez qilishda xatolik yuz berdi");
      }

      if (!data.audioBase64) {
        if ("speechSynthesis" in window) {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(text.trim());
          utterance.rate = playbackSpeed;
          const voices = window.speechSynthesis.getVoices();
          const targetVoice = voices.find(v => v.lang.startsWith("uz") || v.lang.startsWith("ru") || v.lang.startsWith("en"));
          if (targetVoice) utterance.voice = targetVoice;
          
          utterance.onend = () => setIsPlaying(false);
          utterance.onerror = () => setIsPlaying(false);
          
          window.speechSynthesis.speak(utterance);
          setIsPlaying(true);
          setErrorMsg(
            language === "uz"
              ? "Gemini audio sintezatori vaqtinchalik band bo'lgani sababli brauzer audiosi orqali ijro etilmoqda."
              : "Из-за нагрузки на сервер воспроизведение переключено на синтезатор браузера."
          );
          return;
        }
        throw new Error(data.error || (language === "uz" ? "Olingan ma'lumotda audio mavjud emas" : "Аудио не получено"));
      }

      const audioUrl = `data:audio/wav;base64,${data.audioBase64}`;
      setCurrentAudioUrl(audioUrl);

      // Add to history
      const newItem: GeneratedAudioItem = {
        id: `tts-${Date.now()}`,
        text: text.trim().slice(0, 120),
        voice: selectedVoice,
        audioUrl,
        date: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setAudioHistory((prev) => [newItem, ...prev]);

      // Auto play
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.playbackRate = playbackSpeed;
        audioRef.current.play().catch(() => {});
        setIsPlaying(true);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || (language === "uz" ? "Xatolik yuz berdi" : "Произошла ошибка"));
    } finally {
      setIsGenerating(false);
    }
  };

  // Download MP3/Audio file directly
  const handleDownload = (customUrl?: string, customFilename?: string) => {
    const url = customUrl || currentAudioUrl;
    if (!url) return;

    const link = document.createElement("a");
    link.href = url;
    const safeName = customFilename || `darslik-audio-${selectedVoice}-${Date.now()}.mp3`;
    link.download = safeName;
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

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      {/* Hidden Audio Player instance */}
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
      <div className="mb-10 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-brand-primary dark:text-blue-400 text-xs font-bold uppercase tracking-wider mb-4">
          <Headphones size={15} />
          <span>{language === "uz" ? "Audio Darslik Studiyasi" : "Студия создания аудио"}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-4">
          {language === "uz" ? (
            <>Matnni <span className="text-brand-primary">Ovozga Aylantirish</span> & .mp3 Yuklab Olish</>
          ) : (
            <>Преобразование текста в <span className="text-brand-primary">Речь (TTS)</span> & Скачать .mp3</>
          )}
        </h1>
        <p className="max-w-2xl mx-auto text-slate-600 dark:text-slate-400 text-base sm:text-lg">
          {language === "uz"
            ? "Istalgan darslik qoidasi, adabiyot durdonasi, she'r yoki shaxsiy matningizni yozing. Zamonaviy AI orqali uni ravon eshiting va bitta tugma bilan .mp3 formatida saqlab oling."
            : "Введите любой текст учебника, правило, стихотворение или конспект. Слушайте профессиональный голос и скачивайте готовый .mp3 файл одним нажатием."}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Text Input & Configuration (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Text Editor Box */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 transition-all">
            <div className="flex items-center justify-between gap-2 mb-3">
              <label htmlFor="tts-text-input" className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <FileText size={16} className="text-brand-primary" />
                <span>{language === "uz" ? "Ovoz beriladigan matn" : "Текст для озвучивания"}</span>
              </label>

              <div className="flex items-center gap-1.5">
                {text && (
                  <>
                    <button
                      type="button"
                      onClick={handleCopy}
                      title="Nusxa olish"
                      className="p-1.5 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1"
                    >
                      {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                      <span>{copied ? "Nusxa olindi" : "Nusxa"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setText("")}
                      title="Tozalash"
                      className="p-1.5 text-xs text-red-500 hover:text-red-700 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors flex items-center gap-1"
                    >
                      <Trash2 size={14} />
                      <span>{language === "uz" ? "Tozalash" : "Очистить"}</span>
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
                language === "uz"
                  ? "Darslikdan biror bob, she'r yoki konspektingizni shu yerga yozing yoki nusxalab qo'ying..."
                  : "Напишите или вставьте сюда любой текст из учебника, стих или конспект..."
              }
              className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent text-slate-800 dark:text-slate-100 text-sm leading-relaxed resize-y font-normal transition-all"
            />

            {/* Quick Stats */}
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mt-2 px-1">
              <span>
                {text.length} {language === "uz" ? "belgi" : "символов"} · {text.trim() ? text.trim().split(/\s+/).length : 0} {language === "uz" ? "so'z" : "слов"}
              </span>
              <span>
                ~{Math.max(1, Math.round((text.trim().split(/\s+/).length || 0) / 2.5))} {language === "uz" ? "sekundlik audio" : "сек. звучания"}
              </span>
            </div>

            {/* Sample Texts Selector */}
            <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-2">
                {language === "uz" ? "Tayyor namuna matnlar:" : "Готовые образцы текстов:"}
              </span>
              <div className="flex flex-wrap gap-2">
                {SAMPLE_TEXTS.map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setText(sample.text)}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-brand-primary hover:text-white dark:hover:bg-brand-primary dark:hover:text-white transition-all text-left"
                  >
                    ✨ {language === "uz" ? sample.titleUz : sample.titleRu}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Voice Selector */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
              <Mic size={16} className="text-brand-primary" />
              <span>{language === "uz" ? "AI Ovozni Tanlang" : "Выберите голос ИИ"}</span>
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
                          {v.gender === "ayol" ? "♀ Ayol" : "♂ Erkak"}
                        </span>
                      </div>
                      {v.badge && (
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500 text-white">
                          {v.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                      {language === "uz" ? v.descUz : v.descRu}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Generate Button & Error feedback */}
          <div>
            <button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating || !text.trim()}
              className={`w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-3 transition-all shadow-lg ${
                isGenerating || !text.trim()
                  ? "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed shadow-none"
                  : "bg-brand-primary hover:bg-blue-700 active:scale-[0.99] text-white shadow-blue-500/25 hover:shadow-blue-500/35"
              }`}
            >
              {isGenerating ? (
                <>
                  <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>{language === "uz" ? "AI Ovoz Yaratilmoqda..." : "Синтез аудио..."}</span>
                </>
              ) : (
                <>
                  <Sparkles size={20} />
                  <span>{language === "uz" ? "Ovozga Aylantirish & Tayyorlash" : "Озвучить текст"}</span>
                </>
              )}
            </button>

            {errorMsg && (
              <div className="mt-3 p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-xs font-semibold flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Audio Player & Instant .MP3 Download (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Active Audio Player Card */}
          <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white rounded-3xl p-6 shadow-xl border border-slate-800 relative overflow-hidden">
            {/* Background glowing aura */}
            <div className="absolute -right-16 -top-16 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl pointer-events-none"></div>

            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                <Music size={14} />
                <span>{language === "uz" ? "Audio Player" : "Аудиоплеер"}</span>
              </span>

              {currentAudioUrl && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  {language === "uz" ? "Tayyor" : "Готово"}
                </span>
              )}
            </div>

            {currentAudioUrl ? (
              <div className="space-y-5">
                {/* Audio Graphic / Waveform placeholder */}
                <div className="h-20 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center p-4">
                  <div className="flex items-center gap-1 w-full justify-center">
                    {Array.from({ length: 28 }).map((_, i) => (
                      <div
                        key={i}
                        className={`w-1 rounded-full transition-all duration-300 ${
                          isPlaying
                            ? "bg-blue-400 animate-pulse"
                            : "bg-white/20"
                        }`}
                        style={{
                          height: isPlaying
                            ? `${Math.max(8, Math.sin(i * 0.4 + currentTime * 5) * 40 + 20)}px`
                            : `${(i % 5) * 6 + 10}px`,
                        }}
                      ></div>
                    ))}
                  </div>
                </div>

                {/* Progress bar */}
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

                {/* Controls */}
                <div className="flex items-center justify-between">
                  {/* Speed buttons */}
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

                  {/* Play/Pause Button */}
                  <button
                    type="button"
                    onClick={togglePlay}
                    className="w-14 h-14 rounded-full bg-blue-500 hover:bg-blue-400 text-white flex items-center justify-center transition-all shadow-lg shadow-blue-500/40 active:scale-95"
                  >
                    {isPlaying ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
                  </button>

                  {/* Reset / Replay button */}
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

                {/* Direct Download .MP3 Button */}
                <div className="pt-2 border-t border-white/10 space-y-2">
                  <button
                    type="button"
                    onClick={() => handleDownload()}
                    className="w-full py-3.5 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 active:scale-[0.99] text-white font-black text-sm flex items-center justify-center gap-2.5 shadow-lg shadow-emerald-500/25 transition-all"
                  >
                    <Download size={18} />
                    <span>{language === "uz" ? ".MP3 Faylni Yuklab Olish" : "Скачать .MP3 файл"}</span>
                  </button>
                  <p className="text-[11px] text-center text-slate-400">
                    {language === "uz"
                      ? "Fayl telefonda yoki kompyuterda istalgan pleerda bemalol ochiladi"
                      : "Файл воспроизводится на любых устройствах и смартфонах"}
                  </p>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400 space-y-3">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400">
                  <Headphones size={28} />
                </div>
                <p className="text-sm font-semibold">
                  {language === "uz"
                    ? "Hozircha audio yaratilmadi"
                    : "Аудио пока не создано"}
                </p>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  {language === "uz"
                    ? "Chapdagi maydonga matn yozing va 'Ovozga Aylantirish' tugmasini bosing"
                    : "Введите текст слева и нажмите кнопку 'Озвучить текст'"}
                </p>
              </div>
            )}
          </div>

          {/* History of generated audios */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Clock size={16} className="text-brand-primary" />
                <span>{language === "uz" ? "Yaqinda yaratilgan audiolaringiz" : "Недавно созданные"}</span>
              </h3>
              {audioHistory.length > 0 && (
                <button
                  type="button"
                  onClick={() => setAudioHistory([])}
                  className="text-[11px] text-red-500 hover:underline"
                >
                  {language === "uz" ? "Tozalash" : "Очистить"}
                </button>
              )}
            </div>

            {audioHistory.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">
                {language === "uz"
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
                      <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                        {item.text}
                      </p>
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
                        onClick={() => handleDownload(item.audioUrl, `darslik-audio-${item.id}.mp3`)}
                        className="p-2 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-xl hover:bg-emerald-600 hover:text-white transition-all"
                        title=".mp3 yuklab olish"
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
    </div>
  );
}

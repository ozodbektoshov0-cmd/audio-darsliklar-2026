import { useEffect, useRef, useState } from "react";
import { Download, Pause, Play, RefreshCw, Square, Volume2, X } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { cleanTextForSpeech, readVisiblePageText } from "../utils/ttsReaderHelper";

const VOICES = ["Kore", "Puck", "Zephyr", "Fenrir", "Charon"] as const;

export default function SideTtsReader() {
  const { language } = useLanguage();
  const uz = language === "uz";

  const [isOpen, setIsOpen] = useState(false);
  const [text, setText] = useState("");
  const [voice, setVoice] = useState<string>("Kore");
  const [status, setStatus] = useState<"idle" | "loading" | "playing" | "paused">("idle");
  const [engineMode, setEngineMode] = useState<"gemini" | "browser" | null>(null);
  const [audioDataUrl, setAudioDataUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const syncFromPage = () => {
    const detected = readVisiblePageText();
    if (detected) {
      setText(detected);
    }
    setErrorMsg(null);
  };

  useEffect(() => {
    if (isOpen) {
      syncFromPage();
    }
  }, [isOpen]);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const stopPlayback = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setStatus("idle");
  };

  const playWithBrowserSpeech = (spoken: string) => {
    if (!("speechSynthesis" in window)) {
      setErrorMsg(uz ? "Brauzer ovoz sintezini qo'llab-quvvatlamaydi." : "Браузер не поддерживает синтез речи.");
      return;
    }
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(spoken);
    utt.lang = uz ? "uz-UZ" : "ru-RU";
    utt.onend = () => setStatus("idle");
    utt.onerror = () => setStatus("idle");
    window.speechSynthesis.speak(utt);
    setEngineMode("browser");
    setStatus("playing");
  };

  const handleReadAloud = async () => {
    const candidate = cleanTextForSpeech(text || readVisiblePageText());
    if (!candidate) {
      setErrorMsg(uz ? "O'qish uchun matn yoki faol savol topilmadi." : "Текст или активный вопрос не найден.");
      return;
    }
    if (!text.trim()) setText(candidate);

    stopPlayback();
    setStatus("loading");
    setErrorMsg(null);
    setAudioDataUrl(null);

    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: candidate, voice }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.audioBase64) {
        setStatus("idle");
        setErrorMsg(
          data.error ||
            (uz
              ? "Gemini TTS hozircha javob bermadi. Pastdagi brauzer ovozi tugmasidan foydalanishingiz mumkin."
              : "Gemini TTS временно недоступен. Вы можете использовать голос браузера."),
        );
        return;
      }

      const url = `data:audio/wav;base64,${data.audioBase64}`;
      setAudioDataUrl(url);
      setEngineMode("gemini");

      if (audioRef.current) {
        audioRef.current.src = url;
        await audioRef.current.play();
        setStatus("playing");
      }
    } catch {
      setStatus("idle");
      setErrorMsg(
        uz
          ? "Serverga ulanishda xatolik yuz berdi. Brauzer ovozidan foydalanishingiz mumkin."
          : "Ошибка подключения к серверу.",
      );
    }
  };

  const handlePause = () => {
    if (status !== "playing") return;
    if (engineMode === "gemini" && audioRef.current) {
      audioRef.current.pause();
      setStatus("paused");
    } else if (engineMode === "browser" && "speechSynthesis" in window) {
      window.speechSynthesis.pause();
      setStatus("paused");
    }
  };

  const handleResume = () => {
    if (status !== "paused") return;
    if (engineMode === "gemini" && audioRef.current) {
      void audioRef.current.play();
      setStatus("playing");
    } else if (engineMode === "browser" && "speechSynthesis" in window) {
      window.speechSynthesis.resume();
      setStatus("playing");
    }
  };

  const handleDownload = () => {
    if (!audioDataUrl) return;
    const link = document.createElement("a");
    link.href = audioDataUrl;
    link.download = `test-audio-${voice.toLowerCase()}-${Date.now()}.wav`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="no-print fixed right-0 top-1/2 -translate-y-1/2 z-40 flex items-center">
      <audio
        ref={audioRef}
        onEnded={() => setStatus("idle")}
        onPause={() => {
          if (audioRef.current && !audioRef.current.ended && audioRef.current.currentTime > 0 && status === "playing") {
            setStatus("paused");
          }
        }}
        onPlay={() => setStatus("playing")}
      />

      {!isOpen ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          data-testid="side-tts-toggle"
          aria-label={uz ? "Test yoki sahifani ovozli o'qish panelini ochish" : "Открыть панель озвучки текста"}
          className="flex flex-col items-center gap-1.5 py-3 px-2.5 rounded-l-2xl bg-slate-900 dark:bg-blue-600 text-white shadow-xl border border-r-0 border-slate-700 dark:border-blue-500 hover:pr-3.5 transition-all"
        >
          <Volume2 size={18} className={status === "playing" ? "animate-pulse text-amber-300" : ""} />
          <span className="text-[10px] font-black tracking-wide uppercase [writing-mode:vertical-rl]">
            {uz ? "TTS O'qish" : "TTS Чтение"}
          </span>
        </button>
      ) : (
        <div
          data-testid="side-tts-panel"
          className="mr-2 sm:mr-3 w-[310px] sm:w-[350px] rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl p-4 space-y-3"
        >
          <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-brand-primary dark:text-blue-300 flex items-center justify-center">
                <Volume2 size={16} />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white leading-tight">
                  {uz ? "Ovozli O'qib Berish" : "Озвучка теста и текста"}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {uz ? "Test savoli yoki matnni tinglang" : "Прослушайте вопрос или текст"}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label={uz ? "Yopish" : "Закрыть"}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white"
            >
              <X size={16} />
            </button>
          </div>

          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={syncFromPage}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <RefreshCw size={12} />
              <span>{uz ? "Faol test/matnni olish" : "Считать со страницы"}</span>
            </button>

            <select
              value={voice}
              onChange={(e) => setVoice(e.target.value)}
              aria-label={uz ? "Ovoz turi" : "Голос"}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200"
            >
              {VOICES.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>

          <textarea
            rows={3}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={
              uz
                ? "Test savoli avtomatik olinadi yoki bu yerga matn yozing..."
                : "Вопрос подставится автоматически или введите текст..."
            }
            className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 resize-none focus:outline-none focus:ring-2 focus:ring-brand-primary"
          />

          {errorMsg && (
            <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-[11px] text-amber-800 dark:text-amber-200 space-y-1.5">
              <p>{errorMsg}</p>
              <button
                type="button"
                onClick={() => {
                  const clean = cleanTextForSpeech(text || readVisiblePageText());
                  if (clean) playWithBrowserSpeech(clean);
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-600 text-white font-bold text-[11px]"
              >
                <Play size={11} />
                {uz ? "Brauzer ovozida tinglash" : "Озвучить через браузер"}
              </button>
            </div>
          )}

          {/* Controls: Play / Pause / Resume / Stop / Download */}
          <div className="flex flex-wrap items-center gap-2">
            {status === "idle" || status === "loading" ? (
              <button
                type="button"
                disabled={status === "loading"}
                onClick={() => void handleReadAloud()}
                data-testid="side-tts-play"
                className="flex-1 py-2.5 px-3 rounded-xl bg-brand-primary hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 disabled:opacity-60 transition-colors"
              >
                <Play size={14} />
                <span>
                  {status === "loading"
                    ? uz
                      ? "Tayyorlanmoqda..."
                      : "Синтез..."
                    : uz
                      ? "O'qib berish"
                      : "Озвучить"}
                </span>
              </button>
            ) : status === "playing" ? (
              <button
                type="button"
                onClick={handlePause}
                data-testid="side-tts-pause"
                className="flex-1 py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Pause size={14} />
                <span>{uz ? "To'xtatish" : "Пауза"}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleResume}
                data-testid="side-tts-resume"
                className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Play size={14} />
                <span>{uz ? "Davom ettirish" : "Продолжить"}</span>
              </button>
            )}

            {(status === "playing" || status === "paused") && (
              <button
                type="button"
                onClick={stopPlayback}
                aria-label={uz ? "Bekor qilish" : "Остановить"}
                className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-red-50 hover:text-red-600 transition-colors"
              >
                <Square size={14} />
              </button>
            )}

            <button
              type="button"
              disabled={!audioDataUrl}
              onClick={handleDownload}
              data-testid="side-tts-download"
              title={
                audioDataUrl
                  ? uz
                    ? "Ovozni yuklab olish (.wav)"
                    : "Скачать аудио (.wav)"
                  : uz
                    ? "Yuklab olish uchun avval «O'qib berish»ni bosing"
                    : "Сначала нажмите «Озвучить»"
              }
              className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Download size={14} />
              <span>{uz ? "Yuklab olish" : "Скачать"}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

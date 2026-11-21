import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { X, ExternalLink, Download, Maximize2, Minimize2, Gamepad2, AlertCircle } from "lucide-react";
import { getEmbedInfo } from "../utils/pdfHelper";
import { useLanguage } from "../context/LanguageContext";
import type { ReaderDoc } from "../context/ReaderContext";

interface Props {
  doc: ReaderDoc;
  onClose: () => void;
}

export default function PdfReader({ doc, onClose }: Props) {
  const { language } = useLanguage();
  const uz = language === "uz";
  const info = getEmbedInfo(doc.url);
  const [loaded, setLoaded] = useState(false);
  const [slow, setSlow] = useState(false);
  const [full, setFull] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Drive ba'zan iframe'ni bloklaydi; yuklanmasa foydalanuvchiga muqobil yo'lni ko'rsatamiz
  useEffect(() => {
    if (!info.embedUrl) return;
    const t = setTimeout(() => setSlow(true), 8000);
    return () => clearTimeout(t);
  }, [info.embedUrl]);

  const btn =
    "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-white/10 hover:bg-white/20 text-white transition-colors";

  return (
    <div
      className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={doc.title}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className={`flex flex-col bg-slate-900 shadow-2xl overflow-hidden w-full ${
          full ? "h-full rounded-none" : "h-full sm:h-[92vh] sm:max-w-6xl sm:rounded-2xl"
        }`}
      >
        <div className="flex items-center justify-between gap-3 px-3 sm:px-4 py-2.5 bg-slate-800 border-b border-white/10">
          <h2 className="text-sm font-bold text-white truncate">{doc.title}</h2>
          <div className="flex items-center gap-1.5 shrink-0">
            {doc.testsHref && (
              <Link to={doc.testsHref} onClick={onClose} className={`${btn} !bg-emerald-600 hover:!bg-emerald-700`}>
                <Gamepad2 size={14} />
                <span className="hidden sm:inline">{uz ? "Test va o'yinlar" : "Тесты и игры"}</span>
              </Link>
            )}
            {info.downloadUrl && (
              <a href={info.downloadUrl} target="_blank" rel="noopener noreferrer" className={btn} title={uz ? "Yuklab olish" : "Скачать"}>
                <Download size={14} />
                <span className="hidden sm:inline">{uz ? "Yuklab olish" : "Скачать"}</span>
              </a>
            )}
            <a href={info.openUrl} target="_blank" rel="noopener noreferrer" className={btn} title={uz ? "Yangi oynada" : "В новой вкладке"}>
              <ExternalLink size={14} />
            </a>
            <button type="button" onClick={() => setFull((f) => !f)} className={`${btn} hidden sm:inline-flex`} aria-label="Fullscreen">
              {full ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            </button>
            <button type="button" onClick={onClose} className={btn} aria-label={uz ? "Yopish" : "Закрыть"}>
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="relative flex-1 bg-slate-800">
          {info.embedUrl ? (
            <>
              {!loaded && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-slate-300 text-sm pointer-events-none">
                  <div className="w-8 h-8 rounded-full border-2 border-slate-500 border-t-white animate-spin" />
                  {uz ? "Darslik yuklanmoqda..." : "Загрузка учебника..."}
                </div>
              )}
              <iframe
                key={info.embedUrl}
                src={info.embedUrl}
                title={doc.title}
                className="absolute inset-0 w-full h-full border-0"
                allow="fullscreen"
                referrerPolicy="no-referrer"
                onLoad={() => setLoaded(true)}
              />
              {slow && !loaded && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl bg-amber-500 text-slate-900 text-xs font-bold shadow-lg">
                  {uz ? "Uzoq yuklanyapti. " : "Долго загружается. "}
                  <a className="underline" href={info.openUrl} target="_blank" rel="noopener noreferrer">
                    {uz ? "Yangi oynada ochish" : "Открыть в новой вкладке"}
                  </a>
                </div>
              )}
            </>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center text-slate-200">
              <AlertCircle size={36} className="text-amber-400" />
              <p className="max-w-sm text-sm">
                {uz
                  ? "Bu havolani sayt ichida ochib bo'lmaydi. U tashqi sahifada ochiladi."
                  : "Эту ссылку нельзя открыть внутри сайта. Она откроется на внешней странице."}
              </p>
              <a
                href={info.openUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 rounded-xl bg-brand-primary hover:bg-blue-700 text-white text-sm font-bold"
              >
                {uz ? "Ochish" : "Открыть"}
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

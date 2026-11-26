import React from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

interface State {
  hasError: boolean;
  message: string;
  isChunkError: boolean;
}

function isDynamicImportError(error: unknown): boolean {
  const msg = String((error as any)?.message || error || "");
  return (
    msg.includes("Failed to fetch dynamically imported module") ||
    msg.includes("Importing a module script failed") ||
    msg.includes("ChunkLoadError") ||
    msg.includes("Loading chunk")
  );
}

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: "", isChunkError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      message: error?.message || "Kutilmagan xatolik yuz berdi",
      isChunkError: isDynamicImportError(error),
    };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("ErrorBoundary caught error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6">
          <div className="max-w-md w-full p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-red-50 dark:bg-red-950/40 text-red-600 flex items-center justify-center">
              <AlertTriangle size={28} />
            </div>
            <h2 className="text-xl font-serif font-black text-slate-900 dark:text-white">
              {this.state.isChunkError ? "Sahifa versiyasi yangilandi" : "Ilovada xatolik yuz berdi"}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 break-words">
              {this.state.isChunkError
                ? "Yangi modulni yuklash uchun sahifani qayta yangilang yoki qayta urinib ko'ring."
                : "Sahifani qayta yuklang yoki birozdan so'ng urinib ko'ring."}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2.5">
              <button
                type="button"
                onClick={() => this.setState({ hasError: false, message: "", isChunkError: false })}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-sm font-bold hover:border-brand-primary transition-colors"
              >
                Qayta urinish
              </button>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-primary text-white text-sm font-bold hover:bg-blue-700 transition-colors"
              >
                <RotateCcw size={16} />
                Sahifani yangilash
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import PdfReader from "../components/PdfReader";

export interface ReaderDoc {
  url: string;
  title: string;
  /** Shu kitobga bog'langan test/o'yinlar sahifasi (ixtiyoriy) */
  testsHref?: string;
}

interface ReaderContextType {
  openReader: (doc: ReaderDoc) => void;
  closeReader: () => void;
}

const ReaderContext = createContext<ReaderContextType | undefined>(undefined);

export function ReaderProvider({ children }: { children: React.ReactNode }) {
  const [doc, setDoc] = useState<ReaderDoc | null>(null);

  const openReader = useCallback((d: ReaderDoc) => setDoc(d), []);
  const closeReader = useCallback(() => setDoc(null), []);

  // Modal ochiq paytda sahifa aylanmasin
  useEffect(() => {
    if (!doc) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [doc]);

  return (
    <ReaderContext.Provider value={{ openReader, closeReader }}>
      {children}
      {doc && <PdfReader doc={doc} onClose={closeReader} />}
    </ReaderContext.Provider>
  );
}

export function useReader() {
  const ctx = useContext(ReaderContext);
  if (!ctx) throw new Error("useReader must be used within a ReaderProvider");
  return ctx;
}
